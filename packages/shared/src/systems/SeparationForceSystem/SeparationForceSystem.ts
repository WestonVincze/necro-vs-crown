import { defineQuery } from "bitecs";
import { Vector2 } from "$types";
import { GridCell, Position, SeparationForce } from "$components";
import { getGridCellFromEid, getPositionFromEid, profiler } from "$utils";

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
  const query = defineQuery([Position, GridCell, SeparationForce]);

  return (world: World) => {
    const entities = query(world);

    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const position = getPositionFromEid(eid);
      const gridCell = getGridCellFromEid(eid);

      for (let j = i + 1; j < entities.length; j++) {
        const otherEid = entities[j];
        if (eid === otherEid) continue;

        const otherGridCell = getGridCellFromEid(otherEid);
        if (
          Math.abs(gridCell.x - otherGridCell.x) > 1 ||
          Math.abs(gridCell.y - otherGridCell.y) > 1
        )
          continue;

        const otherPosition = getPositionFromEid(otherEid);
        const force = calculateSeparationForce(position, otherPosition);

        SeparationForce.x[eid] -= force.x;
        SeparationForce.y[eid] -= force.y;

        SeparationForce.x[otherEid] += force.x;
        SeparationForce.y[otherEid] += force.y;
      }
    }

    return world;
  };
};
