import { defineQuery, enterQuery, exitQuery, removeEntity } from "bitecs";
import { GameObjects } from "phaser";
import { Subject } from "rxjs";

import { Position, Collider, Projectile } from "../components";
import { attackEntity } from "./CombatSystem";
import { GameState } from "../managers";
/**
 * Another option is to create a collisionSystem factory that accepts
 * - a primary collider
 * - a secondary collider
 * - a callback
 *
 * Pros:
 * - no need to maintain a sort of collision map
 * - no need for a subject
 *
 * Cons:
 * - rigid -> requires instantiation of a system to handle each type of collision
 * - performance? (although this could probably turn into a pro with web workers)
 */

// TODO: consider deferring collisions or tracking collisions to safeguard against multiple simultaneous collisions (like picking up an item)
// TODO: define collisionTypes or create specific collision messages to provide context to subscribers of collisionEvents
export const collisionEvents = new Subject<{ eid1: number; eid2: number }>();

// base collision query
const colliderQuery = defineQuery([Position, Collider]);

export const createProjectileCollisionSystem = () => {
  const query = defineQuery([Position, Collider, Projectile]);

  return (world: World) => {
    for (const projectileEid of query(world)) {
      for (const colliderEid of colliderQuery(world)) {
        if (checkCollision(projectileEid, colliderEid)) {
          // TODO: handle collisions for other types of entities (walls)
          // projectile collided with something
          if (
            attackEntity(
              world,
              colliderEid,
              Projectile.attackBonus[projectileEid],
              Projectile.damage[projectileEid],
            )
          ) {
            removeEntity(world, projectileEid);
          }
        }
      }
    }

    return world;
  };
};

export const createCollisionSystem = () => {
  return (world: World) => {
    const entities = colliderQuery(world);

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const eid1 = entities[i];
        const eid2 = entities[j];

        if (checkCollision(eid1, eid2)) {
          // Collision detected, emit an event
          console.log("collision detected");
          collisionEvents.next({ eid1, eid2 });
        }
      }
    }

    return world;
  };
};

export const createDrawCollisionSystem = (scene: Phaser.Scene) => {
  const onEnter = enterQuery(colliderQuery);
  const onExit = exitQuery(colliderQuery);
  const colliderGraphicsMap = new Map<number, GameObjects.Arc | null>();

  GameState.onDebugEnabled$.subscribe(() => {
    colliderGraphicsMap.forEach((_, eid) => {
      colliderGraphicsMap.set(
        eid,
        scene.add.circle(
          Position.x[eid] + Collider.offsetX[eid],
          Position.y[eid] + Collider.offsetY[eid],
          Collider.radius[eid],
          0xaa5555,
          0.3,
        ),
      );
    });
  });

  GameState.onDebugDisabled$.subscribe(() => {
    colliderGraphicsMap.forEach((arc) => arc?.destroy());
  });

  return (world: World) => {
    // TODO: create a "debugSystem" to enable/disable debugging features without having to create custom debug actions for each system
    for (const eid of onEnter(world)) {
      const arc = GameState.isDebugMode()
        ? scene.add.circle(
            Position.x[eid] + Collider.offsetX[eid],
            Position.y[eid] + Collider.offsetY[eid],
            Collider.radius[eid],
            0xaa5555,
            0.3,
          )
        : null;

      colliderGraphicsMap.set(eid, arc);
    }

    for (const eid of colliderQuery(world)) {
      if (!GameState.isDebugMode()) continue;
      colliderGraphicsMap
        .get(eid)
        ?.setPosition(
          Position.x[eid] + Collider.offsetX[eid],
          Position.y[eid] + Collider.offsetY[eid],
        );
    }

    for (const eid of onExit(world)) {
      colliderGraphicsMap.get(eid)?.destroy();
      colliderGraphicsMap.delete(eid);
    }

    return world;
  };
};

const checkCollision = (eid1: number, eid2: number) => {
  const layer1 = Collider.layer[eid1];
  const layer2 = Collider.layer[eid2];
  const collisionLayers1 = Collider.collisionLayers[eid1];
  const collisionLayers2 = Collider.collisionLayers[eid2];
  const ignoreLayers1 = Collider.ignoreLayers[eid1];
  const ignoreLayers2 = Collider.ignoreLayers[eid2];

  // If either entity is set to ignore the other's layer, ignore this collision
  if ((layer1 & ignoreLayers2) !== 0 || (layer2 & ignoreLayers1) !== 0) {
    return false;
  }

  // If neither entity is set to collide with the other's layer, ignore this collision
  if ((layer1 & collisionLayers2) === 0 && (layer2 & collisionLayers1) === 0) {
    return false;
  }

  const eid1PositionX = Position.x[eid1] + Collider.offsetX[eid1];
  const eid1PositionY = Position.y[eid1] + Collider.offsetY[eid1];

  const eid2PositionX = Position.x[eid2] + Collider.offsetX[eid2];
  const eid2PositionY = Position.y[eid2] + Collider.offsetY[eid2];

  const dx = eid1PositionX - eid2PositionX;
  const dy = eid1PositionY - eid2PositionY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < Collider.radius[eid1] + Collider.radius[eid2];
};
