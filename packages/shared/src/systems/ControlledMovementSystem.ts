import { defineQuery, defineSystem } from "bitecs";
import { Input, MaxMoveSpeed, MoveSpeed, Necro, Player, Velocity } from "../components";
import { normalizeForce } from "../helpers";

const FRICTION = 0.05;

export const createControlledMovementSystem = () => {
  const controlledMovementQuery = defineQuery([Player, Necro, Input, Velocity, MoveSpeed, MaxMoveSpeed])

  return defineSystem(world => {
    const entities = controlledMovementQuery(world);

    for (let i = 0; i < entities.length; i++) {
      console.log(i);
      const eid = entities[i];
      const x = Input.moveX[eid];
      const y = Input.moveY[eid];

      const force = normalizeForce({ x, y });

      // apply x force
      if (force.x === 0) {
        Velocity.x[eid] += -Velocity.x[eid] * FRICTION; // * delta??
      } else {
        Velocity.x[eid] += force.x * MoveSpeed.current[eid];
      }

      // apply y force
      if (force.y === 0) {
        Velocity.y[eid] += -Velocity.y[eid] * FRICTION; // * delta??
      } else {
        Velocity.y[eid] += force.y * MoveSpeed.current[eid];
      }

      // limit max speed
      const magnitude = Math.sqrt(Velocity.x[eid] * Velocity.x[eid] + Velocity.y[eid] * Velocity.y[eid]);
      if (magnitude > MaxMoveSpeed.current[eid]) {
        const scale = MaxMoveSpeed.current[eid] / magnitude
        Velocity.x[eid] *= scale;
        Velocity.y[eid] *= scale;
      }
    }

    return world;
  })
}
