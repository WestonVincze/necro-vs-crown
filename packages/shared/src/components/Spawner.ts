import { UnitName } from "$types";

export const Spawner = {
  timeUntilSpawn: [] as number[],
  xMin: [] as number[],
  xMax: [] as number[],
  yMin: [] as number[],
  yMax: [] as number[],
};

export const SpawnTarget = defineRelation({ exclusive: true });

export const BuildingSpawner = [] as {
  spawnableUnits: UnitName[];
}[];
