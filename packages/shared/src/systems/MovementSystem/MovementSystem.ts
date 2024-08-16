import { defineQuery } from "bitecs";
import {
  Position,
  Velocity,
  Input,
  MoveSpeed,
  MaxMoveSpeed,
} from "../../components";
import { normalizeForce } from "../../helpers";
import { MAP_HEIGHT_PIXELS, MAP_WIDTH_PIXELS } from "../../constants";

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

      // clamp to screen size
      Position.x[eid] = Math.max(
        -MAP_WIDTH_PIXELS / 2,
        Math.min(MAP_WIDTH_PIXELS / 2, Position.x[eid]),
      );
      Position.y[eid] = Math.max(
        -MAP_HEIGHT_PIXELS / 2,
        Math.min(MAP_HEIGHT_PIXELS / 2, Position.y[eid]),
      );
    }
    return world;
  };
};
