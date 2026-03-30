import {
  Armor,
  MaxHealth,
  StatName,
  UnitMeta,
  UpdateStatsRequest,
} from "../../components";
import { StatUpdate, UnitName } from "../../types";
import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createStatUpdateSystem,
  updateStatsByEid,
  updateUnitBaseStats,
} from "./StatUpdateSystem";

const BASE_STAT_VALUE = 10;
const STAT_INCREASE_VALUE = 5;
const STAT_DECREASE_VALUE = -5;

const MOCK_STAT_UPDATE_INCREASE: StatUpdate[] = [
  {
    name: StatName.Armor,
    value: STAT_INCREASE_VALUE,
  },
];

const MOCK_STAT_UPDATE_DECREASE: StatUpdate[] = [
  {
    name: StatName.Armor,
    value: STAT_DECREASE_VALUE,
  },
];

describe("StatUpdateSystem", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe("updateStat", () => {
    it("adds an UpdateStatRequest component with correct values", () => {
      const eid = addEntity(world);
      updateStatsByEid(world, eid, MOCK_STAT_UPDATE_INCREASE);

      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(true);
      expect(UpdateStatsRequest[eid].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
    });

    it("does nothing if entity does not exit", () => {
      const eid = 1;
      updateStatsByEid(world, eid, MOCK_STAT_UPDATE_INCREASE);

      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });

    it("accumulates value if multiple requests are made to the same entity and stat", () => {
      const eid = addEntity(world);
      updateStatsByEid(world, eid, MOCK_STAT_UPDATE_INCREASE);
      updateStatsByEid(world, eid, MOCK_STAT_UPDATE_INCREASE);
      updateStatsByEid(world, eid, MOCK_STAT_UPDATE_INCREASE);

      expect(UpdateStatsRequest[eid].statUpdates.length).toBe(1);
      expect(UpdateStatsRequest[eid].statUpdates[0].value).toBe(
        STAT_INCREASE_VALUE * 3,
      );
    });
  });

  describe("updateStatsByUnitType", () => {
    it("adds UpdateStatsRequest with given values to units that match the UnitName parameter", () => {
      const skeleton1 = addEntity(world);
      const skeleton2 = addEntity(world);
      const skeleton3 = addEntity(world);

      addComponent(world, skeleton1, UnitMeta);
      UnitMeta.name[skeleton1] = UnitName.Skeleton;
      addComponent(world, skeleton2, UnitMeta);
      UnitMeta.name[skeleton2] = UnitName.Skeleton;
      addComponent(world, skeleton3, UnitMeta);
      UnitMeta.name[skeleton3] = UnitName.Skeleton;

      updateUnitBaseStats(world, UnitName.Skeleton, MOCK_STAT_UPDATE_INCREASE);

      expect(hasComponent(world, skeleton1, UpdateStatsRequest)).toBe(true);
      expect(UpdateStatsRequest[skeleton1].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
      expect(hasComponent(world, skeleton2, UpdateStatsRequest)).toBe(true);
      expect(UpdateStatsRequest[skeleton2].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
      expect(hasComponent(world, skeleton3, UpdateStatsRequest)).toBe(true);
      expect(UpdateStatsRequest[skeleton3].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
    });

    it("does not effect units that don't match the provided unitName", () => {
      const skeleton = addEntity(world);
      const guard = addEntity(world);
      const paladin = addEntity(world);

      addComponent(world, skeleton, UnitMeta);
      UnitMeta.name[skeleton] = UnitName.Skeleton;
      addComponent(world, guard, UnitMeta);
      UnitMeta.name[guard] = UnitName.Guard;
      addComponent(world, paladin, UnitMeta);
      UnitMeta.name[paladin] = UnitName.Paladin;

      updateUnitBaseStats(world, UnitName.Skeleton, MOCK_STAT_UPDATE_INCREASE);

      expect(hasComponent(world, skeleton, UpdateStatsRequest)).toBe(true);
      expect(UpdateStatsRequest[skeleton].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
      expect(hasComponent(world, guard, UpdateStatsRequest)).toBe(false);
      expect(hasComponent(world, paladin, UpdateStatsRequest)).toBe(false);
    });

    it("does not break if no units are found", () => {
      updateUnitBaseStats(world, UnitName.Skeleton, MOCK_STAT_UPDATE_INCREASE);
    });
  });

  describe("statUpdateSystem", () => {
    let eid: number;
    let statUpdateSystem: (world: World) => World;

    beforeEach(() => {
      statUpdateSystem = createStatUpdateSystem();
      eid = addEntity(world);
      addComponent(world, eid, Armor);
      addComponent(world, eid, UpdateStatsRequest);
    });

    it("modifies the stat of a unit and removes the UpdateStatsRequest component", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_INCREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(Armor.current[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });

    it("does not error and removes the UpdateStatsRequest component if the entity doesn't have the stat", () => {
      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_INCREASE };

      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(true);

      statUpdateSystem(world);

      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });

    it("handles multiple stat updates at once", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = {
        statUpdates: [
          ...MOCK_STAT_UPDATE_INCREASE,
          ...MOCK_STAT_UPDATE_INCREASE,
        ],
      };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE * 2);
      expect(Armor.current[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE * 2,
      );
      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);

      addComponent(world, eid, UpdateStatsRequest);
      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_INCREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE * 3);
      expect(Armor.current[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE * 3,
      );
      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });

    it("handles multiple distinct stat updates at once", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      addComponent(world, eid, MaxHealth);
      MaxHealth.base[eid] = BASE_STAT_VALUE;
      MaxHealth.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = {
        statUpdates: [
          ...MOCK_STAT_UPDATE_INCREASE,
          { name: StatName.MaxHealth, value: STAT_INCREASE_VALUE },
        ],
      };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(Armor.current[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(MaxHealth.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(MaxHealth.current[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE,
      );
      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });

    it("handles negative stat updates", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_DECREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_DECREASE_VALUE);
      expect(Armor.current[eid]).toBe(BASE_STAT_VALUE + STAT_DECREASE_VALUE);
      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });

    it("does not allow stats to fall below 0", () => {
      Armor.base[eid] = 1;
      Armor.base[eid] = 1;

      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_DECREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(0);
    });

    it("handles positive and negative stat update requests", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = {
        statUpdates: [
          ...MOCK_STAT_UPDATE_DECREASE,
          ...MOCK_STAT_UPDATE_INCREASE,
        ],
      };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE + STAT_DECREASE_VALUE,
      );
      expect(Armor.current[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE + STAT_DECREASE_VALUE,
      );
      expect(hasComponent(world, eid, UpdateStatsRequest)).toBe(false);
    });
  });
});
