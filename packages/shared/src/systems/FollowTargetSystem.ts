import { defineQuery, defineSystem } from "bitecs"
import { Input, Position, Target, Velocity } from "../components";
import { type Vector2 } from "../types";

const SEPARATION_THRESHOLD = 30;
const SEPARATION_THRESHOLD_SQUARED = SEPARATION_THRESHOLD ** 2;

// TODO: change Vector2 to Transform to compensate for height/width
const calculateSeparationForce = (self: Vector2, target: Vector2): Vector2 => {
  const separationForce = { x: 0, y: 0 };

  const dx = target.x - self.x;
  const dy = target.y - self.y;

  const distanceSquared = dx ** 2 + dy ** 2;

  if (distanceSquared > SEPARATION_THRESHOLD_SQUARED) return separationForce;

  return { x: dx - SEPARATION_THRESHOLD, y: dy - SEPARATION_THRESHOLD };
}

const calculateFollowForce = (self: Vector2, target: Vector2): Vector2 => {
  // return { x: target.x - self.x, y: target.y - self.y };
  const followForce = { x: 0, y: 0 };
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 100) return { x: dx, y: dy };

  return followForce;
}

export const createFollowTargetSystem = () => {
  const followTargetQuery = defineQuery([Position, Input, Velocity, Target]);

  return defineSystem(world => {
    const entities = followTargetQuery(world);
    for (let i = 0; i < entities.length; i++) {
      // get required data
      const eid = entities[i];
      const targetEid = Target.eid[eid];
      const tx = Position.x[targetEid];
      const ty = Position.y[targetEid];
      const px = Position.x[eid];
      const py = Position.y[eid];

      const position = { x: px, y: py };
      const target = { x: tx, y: ty };

      // calculate follow force
      const followForce: Vector2 = calculateFollowForce(position, target);

      // calculate separation force
      const separationForce: Vector2 = { x: 0, y: 0}

      // TODO: apply (half?) force to self and target, otherwise we only apply force to self and skip the calculation when the other entity targets self
      for (let j = 0; j < entities.length; j++) {
        const otherEid = entities[j];
        if (eid === otherEid) continue;
        const ox = Position.x[otherEid];
        const oy = Position.y[otherEid];
        const otherPosition = { x: ox, y: oy };

        const force = calculateSeparationForce(position, otherPosition);
        separationForce.x -= force.x;
        separationForce.y -= force.y;
      }

      Input.moveX[eid] = followForce.x + separationForce.x * 2;
      Input.moveY[eid] = followForce.y + separationForce.y * 2;
    }

    return world;
  })
}
