import { defineQuery, getRelationTargets, hasComponent } from "bitecs";
import { createUnitEntity } from "$entities";
import { BuildingSpawner, Position, Spawner, SpawnTarget } from "$components";
import { getRandomElement } from "$utils";
import { decideEnemyToSpawn } from "./decideEnemyToSpawn";

const MIN_RANGE = 300;
const MAX_RANGE = 500;

export const createUnitSpawnerSystem = () => {
  let difficultyScale = 1.0;
  const spawnNearTargetQuery = defineQuery([Spawner, SpawnTarget("*")]);
  const spawnAtBuildingQuery = defineQuery([Spawner, BuildingSpawner]);

  return (world: World) => {
    for (const eid of spawnNearTargetQuery(world)) {
      Spawner.timeUntilSpawn[eid] -= world.time.delta;
      if (Spawner.timeUntilSpawn[eid] <= 0) {
        const target = getRelationTargets(world, SpawnTarget, eid)[0];
        if (!hasComponent(world, Position, target)) {
          console.warn(`SpawnTarget ${target} does not have a Position`);
          continue;
        }

        const { x, y } = getRandomPositionWithinRange(
          Position.x[target],
          Position.y[target],
          MIN_RANGE,
          MAX_RANGE,
        );

        createUnitEntity(world, decideEnemyToSpawn(difficultyScale), x, y);
        Spawner.timeUntilSpawn[eid] = 5000;
        difficultyScale += 0.02;
      }
    }

    for (const eid of spawnAtBuildingQuery(world)) {
      // select random unit from spawnableUnits
      Spawner.timeUntilSpawn[eid] -= world.time.delta;
      if (Spawner.timeUntilSpawn[eid] <= 0) {
        const unit = getRandomElement(BuildingSpawner[eid].spawnableUnits);
        if (unit === undefined) continue;

        const x = Math.random() * Spawner.xMax[eid] - Spawner.xMin[eid];
        const y = Math.random() * Spawner.yMax[eid] - Spawner.yMin[eid];
        createUnitEntity(world, unit, x, y);

        // TODO: get time value from building data
        Spawner.timeUntilSpawn[eid] = 5000;
      }
    }

    return world;
  };
};

const getRandomPositionWithinRange = (
  baseX: number,
  baseY: number,
  minRange: number,
  maxRange: number,
): { x: number; y: number } => {
  if (minRange >= maxRange) {
    throw new Error("minRange must be less than maxRange");
  }

  let x, y;
  do {
    x =
      baseX +
      (Math.random() * (maxRange - minRange) + minRange) *
        (Math.random() < 0.5 ? -1 : 1);
    y =
      baseY +
      (Math.random() * (maxRange - minRange) + minRange) *
        (Math.random() < 0.5 ? -1 : 1);
  } while (Math.abs(x - baseX) < minRange || Math.abs(y - baseY) < minRange);

  return { x, y };
};
