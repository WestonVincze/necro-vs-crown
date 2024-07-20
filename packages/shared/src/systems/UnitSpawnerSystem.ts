import { defineQuery, getRelationTargets, hasComponent } from "bitecs";
import { createUnitEntity } from "../entities";
import { Position, Spawner, SpawnTarget } from "../components";

const MIN_RANGE = 300;
const MAX_RANGE = 500;

export const createUnitSpawnerSystem = () => {
  let difficultyScale = 1.0;
  const query = defineQuery([Spawner, SpawnTarget("*")]);

  return (world: World) => {
    for (const eid of query(world)) {
      Spawner.timeUntilSpawn[eid] -= world.time.delta;
      if (Spawner.timeUntilSpawn[eid] <= 0) {
        // spawn entity
        const target = getRelationTargets(world, SpawnTarget, eid)[0];
        if (!hasComponent(world, Position, target)) {
          console.warn(`SpawnTarget ${target} does not have a Position`);
          continue;
        }
        // const x = Math.random() * Spawner.xMax[eid] - Spawner.xMin[eid];
        // const y = Math.random() * Spawner.yMax[eid] - Spawner.yMin[eid];
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

const decideEnemyToSpawn = (scale: number) => {
  const randomRoll = Math.random();

  // only peasants
  if (scale < 1.3) return "Peasant";

  // 50% peasants, 50% guards
  if (scale < 1.8 && randomRoll > 0.5) return "Peasant";

  // 30% paladin
  if (scale > 2 && randomRoll <= 0.3) return "Paladin";

  // 10% - 30% archer
  if (scale > 2.3 && randomRoll >= Math.max(0.7, 0.9 - (scale - 2.3) / 10))
    return "Archer";

  // 10% - 30% doppelsolder
  if (scale > 2.6 && randomRoll >= Math.max(0.4, 0.8 - (scale - 2.6) / 5))
    return "Doppelsoldner";

  // 70% - 10% guard
  return "Guard";
};
