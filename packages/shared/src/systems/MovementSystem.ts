import { defineQuery, defineSystem } from "bitecs";
import { Position, Velocity, Target, Player, Input, MoveSpeed, MaxMoveSpeed } from "../components";
import { normalizeForce } from "../helpers";

const FRICTION = 0.05;

/**
 * MovementSystem
 * read from inputPayload -> { moveX, moveY } 
 * read from stats -> moveSpeed, maxMoveSpeed
 * normalize forces
 * apply force with moveSpeed
 * apply friction
 * cap speed
 */
export const createMovementSystem = () => {
  const movementQuery = defineQuery([Position, Input, Velocity, MoveSpeed, MaxMoveSpeed]);

  return defineSystem((world) => {
    const entities = movementQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const x = Input.moveX[eid];
      const y = Input.moveY[eid];
      const newVelocity = { x: Velocity.x[eid], y: Velocity.y[eid] };

      const force = normalizeForce({ x, y });

      // apply x force
      if (force.x === 0) {
        newVelocity.x += -newVelocity.x * FRICTION; // * delta??
      } else {
        newVelocity.x += force.x * MoveSpeed.current[eid];
      }

      // apply y force
      if (force.y === 0) {
        newVelocity.y += -newVelocity.y * FRICTION; // * delta??
      } else {
        newVelocity.y += force.y * MoveSpeed.current[eid];
      }

      // limit max speed
      const magnitude = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
      if (magnitude > MaxMoveSpeed.current[eid]) {
        const scale = MaxMoveSpeed.current[eid] / magnitude
        newVelocity.x *= scale;
        newVelocity.y *= scale;
      }

      Velocity.x[eid] = newVelocity.x;
      Velocity.y[eid] = newVelocity.y;

      Position.x[eid] += Velocity.x[eid];
      Position.y[eid] += Velocity.y[eid];
    }
    return world;
  })
}
