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
  const query = defineQuery([Collider, Position]);
  const onEnter = enterQuery(colliderQuery);
  const onExit = exitQuery(colliderQuery);
  const colliderGraphicsMap = new Map<number, GameObjects.Arc>();

  return (world: World) => {
    // TODO: create a "debugSystem" to enable/disable debugging features without having to create custom debug actions for each system
    /* 
    if (!GameState.isDebugMode()) {
      colliderGraphicsMap.forEach((arc) => arc.destroy());
      colliderGraphicsMap.clear();
      return world;
    }
    */

    for (const eid of onEnter(world)) {
      const arc = scene.add.circle(
        Position.x[eid],
        Position.y[eid],
        Collider.radius[eid],
        0xaa555522,
      );

      colliderGraphicsMap.set(eid, arc);
    }

    for (const eid of colliderQuery(world)) {
      colliderGraphicsMap
        .get(eid)
        ?.setPosition(Position.x[eid], Position.y[eid]);
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

  const dx = Position.x[eid1] - Position.x[eid2];
  const dy = Position.y[eid1] - Position.y[eid2];
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < Collider.radius[eid1] + Collider.radius[eid2];
};
