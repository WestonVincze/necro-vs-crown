import { addComponent, addEntity } from "bitecs";
import {
  BuildingSpawner,
  Position,
  Spawner,
  SpawnTarget,
  Sprite,
  SpriteType,
  Transform,
} from "../components";
import type { UnitName, Vector2, World } from "../types";
import { SpriteTexture } from "../constants";

export const createTargetSpawnerEntity = (world: World, targetEid: number) => {
  const eid = addEntity(world);
  addComponent(world, eid, Spawner);
  Spawner.timeUntilSpawn[eid] = 500;

  addComponent(world, eid, SpawnTarget(targetEid));

  return eid;
};

export const createBuildingSpawnerEntity = (
  world: World,
  units: UnitName[],
  position: Vector2,
  maxUnits: number,
) => {
  const eid = addEntity(world);
  addComponent(world, eid, Spawner);
  Spawner.timeUntilSpawn[eid] = 500;
  Spawner.xMin[eid] = -50;
  Spawner.xMax[eid] = 50;
  Spawner.yMin[eid] = -50;
  Spawner.yMax[eid] = 50;

  addComponent(world, eid, BuildingSpawner);
  BuildingSpawner[eid] = { spawnableUnits: units, unitCount: 0, maxUnits };

  addComponent(world, eid, Sprite);
  Sprite.height[eid] = 175;
  Sprite.width[eid] = 175;
  Sprite.texture[eid] = SpriteTexture["Hut"];
  Sprite.type[eid] = SpriteType.Sprite;

  addComponent(world, eid, Position);
  Position.x[eid] = position.x;
  Position.y[eid] = position.y;

  addComponent(world, eid, Transform);
  Transform.height[eid] = 175;
  Transform.width[eid] = 175;
  Transform.rotation[eid] = 0;

  return eid;
};
