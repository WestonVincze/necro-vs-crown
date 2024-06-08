import { defineQuery, defineSystem, removeComponent, removeEntity } from 'bitecs';
import { Position, Collider, Sprite } from '../components';
import { Subject } from 'rxjs';
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
export const collisionEvents = new Subject<{ eid1: number, eid2: number }>();

export const createCollisionSystem = () => {
  const collisionQuery = defineQuery([Position, Collider]);

  return defineSystem((world) => {
    const entities = collisionQuery(world);

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const eid1 = entities[i];
        const eid2 = entities[j];

        // entity colliders have no common layers
        if ((Collider.layer[eid1] & Collider.layer[eid2]) === 0) {
          continue;
        }

        const dx = Position.x[eid1] - Position.x[eid2];
        const dy = Position.y[eid1] - Position.y[eid2];
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < Collider.radius[eid1] + Collider.radius[eid2]) {
          // Collision detected, emit an event
          console.log("collision detected")
          collisionEvents.next({ eid1, eid2 });
        }
      }
    }

    return world;
  })
};
