import { defineQuery, defineSystem } from "bitecs";
import { Position } from "../../components";

/**
 * Performance optimization concept
 */

export const DistanceMap = new Map<number, Map<number, number>>();

export const createDistanceMapSystem = () => {
  const positionQuery = defineQuery([Position]);

  return defineSystem((world) => {
    const entities = positionQuery(world);

    DistanceMap.clear();

    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const xA = Position.x[entityA];
      const yA = Position.y[entityA];

      for (let j = i + 1; j < entities.length; j++) {
        const entityB = entities[j];
        const xB = Position.x[entityB];
        const yB = Position.y[entityB];

        const dx = xA - xB;
        const dy = yA - yB;
        const distanceSquared = dx * dx + dy * dy;

        if (!DistanceMap.has(entityA)) {
          DistanceMap.set(entityA, new Map<number, number>());
        }
        if (!DistanceMap.has(entityB)) {
          DistanceMap.set(entityB, new Map<number, number>());
        }

        DistanceMap.get(entityA)!.set(entityB, distanceSquared);
        DistanceMap.get(entityB)!.set(entityA, distanceSquared);
      }
    }

    return world;
  });
};

export const getEntitiesWithinDistance = (
  entity: number,
  maxDistance: number,
): number[] => {
  const maxDistanceSquared = maxDistance * maxDistance;
  const nearbyEntities: number[] = [];

  const distances = DistanceMap.get(entity);
  if (distances) {
    for (const [otherEntity, distanceSquared] of distances) {
      if (distanceSquared <= maxDistanceSquared) {
        nearbyEntities.push(otherEntity);
      }
    }
  }

  return nearbyEntities;
};
