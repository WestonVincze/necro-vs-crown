import { defineQuery } from "bitecs";
import { Vector2 } from "../../types";
import { Input, Position } from "../../components";
import { getPositionFromEid } from "../../utils";

export const SEPARATION_THRESHOLD = 50;
const SEPARATION_THRESHOLD_SQUARED = SEPARATION_THRESHOLD ** 2;

// TODO: change Vector2 to Transform to compensate for height/width
const calculateSeparationForce = (
  position: Vector2,
  targetPosition: Vector2,
): Vector2 => {
  const separationForce = { x: 0, y: 0 };

  const dx = targetPosition.x - position.x;
  const dy = targetPosition.y - position.y;

  const distanceSquared = dx ** 2 + dy ** 2;

  if (distanceSquared > SEPARATION_THRESHOLD_SQUARED) return separationForce;

  const distance = Math.sqrt(distanceSquared);

  return { x: dx / distance, y: dy / distance };
};

/**
 * Modifies moveX and moveY of Input when a unit entity is too close to another
 * * SeparationForce should be applied after Input is set and before it is applied
 */
export const createSeparationForceSystem = () => {
  const query = defineQuery([Position, Input]);
  return (world: World) => {
    const entities = query(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const position = getPositionFromEid(eid);

      // calculate separation force
      const separationForce: Vector2 = { x: 0, y: 0 };

      // TODO: apply (half?) force to self and target, otherwise we only apply force to self and skip the calculation when the other entity targets self
      for (const otherEid of entities) {
        if (eid === otherEid) continue;
        const otherPosition = getPositionFromEid(otherEid);

        const force = calculateSeparationForce(position, otherPosition);
        separationForce.x -= force.x;
        separationForce.y -= force.y;
      }

      Input.moveX[eid] += separationForce.x;
      Input.moveY[eid] += separationForce.y;
    }

    return world;
  };
};
