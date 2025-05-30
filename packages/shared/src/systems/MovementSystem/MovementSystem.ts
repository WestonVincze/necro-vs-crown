import { defineQuery, hasComponent } from "bitecs";
import {
  Position,
  Velocity,
  Input,
  MoveSpeed,
  MaxMoveSpeed,
  SeparationForce,
  Transform,
} from "$components";
import { clampToScreenSize, normalizeForce } from "$utils";

const FRICTION = 0.05;

/**
 * Creates a movement system that updates the position and velocity of entities based on their input and movement speed.
 * @returns The movement system function.
 *
 * [Input] is reset after movement calculation
 */
export const createMovementSystem = () => {
  const movementQuery = defineQuery([
    Position,
    Input,
    Velocity,
    MoveSpeed,
    MaxMoveSpeed,
  ]);

  return (world: World) => {
    const entities = movementQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const x = Input.moveX[eid];
      const y = Input.moveY[eid];
      const newVelocity = { x: Velocity.x[eid], y: Velocity.y[eid] };

      if (hasComponent(world, SeparationForce, eid)) {
        newVelocity.x += SeparationForce.x[eid];
        newVelocity.y += SeparationForce.y[eid];
        SeparationForce.x[eid] = 0;
        SeparationForce.y[eid] = 0;
      }

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
      const magnitude = Math.sqrt(
        newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y,
      );
      if (magnitude > MaxMoveSpeed.current[eid]) {
        const scale = MaxMoveSpeed.current[eid] / magnitude;
        newVelocity.x *= scale;
        newVelocity.y *= scale;
      }

      Velocity.x[eid] = newVelocity.x;
      Velocity.y[eid] = newVelocity.y;

      Position.x[eid] += Velocity.x[eid];
      Position.y[eid] += Velocity.y[eid];

      Input.moveX[eid] = 0;
      Input.moveY[eid] = 0;

      const bounds = { width: 0, height: 0 };
      if (hasComponent(world, Transform, eid)) {
        bounds.width = Transform.width[eid];
        bounds.height = Transform.height[eid];
      }

      const position = clampToScreenSize(
        { x: Position.x[eid], y: Position.y[eid] },
        bounds,
      );
      Position.x[eid] = position.x;
      Position.y[eid] = position.y;
    }
    return world;
  };
};
