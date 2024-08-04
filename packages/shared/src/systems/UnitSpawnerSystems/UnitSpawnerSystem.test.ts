import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addComponent, addEntity, createWorld, getAllEntities } from "bitecs";
import { createUnitSpawnerSystem } from "./UnitSpawnerSystem";
import {
  BuildingSpawner,
  Position,
  Spawner,
  SpawnTarget,
} from "../../components";
import { UnitName } from "../../types";
import * as utils from "./decideEnemyToSpawn";

describe("UnitSpawnerSystems", () => {
  let world: World;
  let eid: number;
  let unitSpawnerSystem: (world: World) => World;

  beforeEach(() => {
    world = createWorld();
    world.time = {
      delta: 1,
      elapsed: 0,
      then: 0,
    };
    eid = addEntity(world);
    unitSpawnerSystem = createUnitSpawnerSystem();
    addComponent(world, Spawner, eid);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("decideEnemyToSpawn", () => {
    it("only returns Peasant at base difficulty", () => {
      const unit = utils.decideEnemyToSpawn(1);
      expect(unit).toBe(UnitName.Peasant);
    });
  });

  describe("SpawnNearTargetSystem", () => {
    let target: number;
    beforeEach(() => {
      target = addEntity(world);
      addComponent(world, SpawnTarget(target), eid);
    });

    it("can spawn a unit", () => {
      addComponent(world, Position, target);

      Spawner.timeUntilSpawn[eid] = 1;

      expect(getAllEntities(world).length).toBe(2);

      unitSpawnerSystem(world);
      expect(getAllEntities(world).length).toBe(3);
    });

    it("sets timeUntilSpawn after spawning", () => {
      addComponent(world, Position, target);

      Spawner.timeUntilSpawn[eid] = 1;

      unitSpawnerSystem(world);
      expect(Spawner.timeUntilSpawn[eid]).toBeGreaterThan(0);
    });

    it("increases difficultyScale after each call", () => {
      const spyOnDecideEnemyToSpawn = vi.spyOn(utils, "decideEnemyToSpawn");
      addComponent(world, Position, target);

      Spawner.timeUntilSpawn[eid] = 1;

      unitSpawnerSystem(world);
      expect(spyOnDecideEnemyToSpawn).toHaveBeenCalledOnce();

      Spawner.timeUntilSpawn[eid] = 1;
      unitSpawnerSystem(world);
      expect(spyOnDecideEnemyToSpawn.mock.calls[1][0]).toBeGreaterThan(1);
    });

    it("does nothing if timeUntilSpawn is greater than 0", () => {
      addComponent(world, Position, target);

      Spawner.timeUntilSpawn[eid] = 5;

      expect(getAllEntities(world).length).toBe(2);
      unitSpawnerSystem(world);
      expect(getAllEntities(world).length).toBe(2);
    });

    it("displays a warning if [SpawnTarget] does not have [Position]", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      const target = addEntity(world);

      addComponent(world, SpawnTarget(target), eid);
      Spawner.timeUntilSpawn[eid] = 1;

      unitSpawnerSystem(world);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });
  });

  describe("SpawnAtBuildingSystem", () => {
    beforeEach(() => {
      addComponent(world, BuildingSpawner, eid);
    });

    it("can spawn a unit", () => {
      BuildingSpawner[eid] = { spawnableUnits: [UnitName.Peasant] };

      Spawner.timeUntilSpawn[eid] = 1;

      expect(getAllEntities(world).length).toBe(1);
      unitSpawnerSystem(world);
      expect(getAllEntities(world).length).toBe(2);
    });
  });
});
