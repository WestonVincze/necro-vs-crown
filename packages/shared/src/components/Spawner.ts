import { UnitName } from "../types";
import { createRelation, makeExclusive } from "bitecs";

export const Spawner = {
  timeUntilSpawn: [] as number[],
  xMin: [] as number[],
  xMax: [] as number[],
  yMin: [] as number[],
  yMax: [] as number[],
};

export const SpawnTarget = createRelation(makeExclusive);

export const BuildingSpawner = [] as {
  spawnableUnits: UnitName[];
}[];
