import { Not, query, removeEntity } from "bitecs";
import { Subject } from "rxjs";

import { Position, Collider, Projectile } from "../../components";
import { attackEntity } from "../CombatSystem";
import { type World } from "../../types";
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

export const createProjectileCollisionSystem = () => {
  return (world: World) => {
    for (const projectileEid of query(world, [
      Position,
      Collider,
      Projectile,
    ])) {
      for (const colliderEid of query(world, [
        Position,
        Collider,
        Not(Projectile),
      ])) {
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
            break;
          }
        }
      }
    }

    return world;
  };
};

const checkCollision = (eid1: number, eid2: number) => {
  if (eid1 === eid2) return false;

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
