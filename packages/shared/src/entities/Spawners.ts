import { addComponent, addEntity } from "bitecs";
import { BuildingSpawner, Spawner, SpawnTarget } from "$components";
import { UnitName } from "$types";

export const createTargetSpawnerEntity = (world: World, targetEid: number) => {
  const eid = addEntity(world);
  addComponent(world, eid, Spawner);
  Spawner.timeUntilSpawn[eid] = 500;

  addComponent(world, SpawnTarget(targetEid), eid);

  return eid;
};

export const createBuildingSpawnerEntity = (
  world: World,
  units: UnitName[],
) => {
  const eid = addEntity(world);
  addComponent(world, eid, Spawner);
  Spawner.timeUntilSpawn[eid] = 500;
  Spawner.xMin[eid] = 300;
  Spawner.xMax[eid] = 600;
  Spawner.yMin[eid] = 300;
  Spawner.yMax[eid] = 600;

  addComponent(world, eid, BuildingSpawner);
  BuildingSpawner[eid] = { spawnableUnits: units };

  return eid;
};
