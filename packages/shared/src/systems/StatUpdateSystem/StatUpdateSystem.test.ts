import {
  Armor,
  MaxHealth,
  StatName,
  Unit,
  UpdateStatsRequest,
} from "../../components";
import { StatUpdate, UnitName } from "../../types";
import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createStatUpdateSystem,
  updateStatsByEid,
  updateStatsByUnitType,
} from "./StatUpdateSystem";

const BASE_STAT_VALUE = 10;
const STAT_INCREASE_VALUE = 5;
const STAT_DECREASE_VALUE = -5;

const MOCK_STAT_UPDATE_INCREASE: StatUpdate[] = [
  {
    stat: StatName.Armor,
    value: STAT_INCREASE_VALUE,
  },
];

const MOCK_STAT_UPDATE_DECREASE: StatUpdate[] = [
  {
    stat: StatName.Armor,
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

      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(true);
      expect(UpdateStatsRequest[eid].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
    });

    it("does nothing if entity does not exit", () => {
      const eid = 1;
      updateStatsByEid(world, eid, MOCK_STAT_UPDATE_INCREASE);

      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
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

      addComponent(world, Unit, skeleton1);
      Unit.name[skeleton1] = UnitName.Skeleton;
      addComponent(world, Unit, skeleton2);
      Unit.name[skeleton2] = UnitName.Skeleton;
      addComponent(world, Unit, skeleton3);
      Unit.name[skeleton3] = UnitName.Skeleton;

      updateStatsByUnitType(
        world,
        UnitName.Skeleton,
        MOCK_STAT_UPDATE_INCREASE,
      );

      expect(hasComponent(world, UpdateStatsRequest, skeleton1)).toBe(true);
      expect(UpdateStatsRequest[skeleton1].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
      expect(hasComponent(world, UpdateStatsRequest, skeleton2)).toBe(true);
      expect(UpdateStatsRequest[skeleton2].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
      expect(hasComponent(world, UpdateStatsRequest, skeleton3)).toBe(true);
      expect(UpdateStatsRequest[skeleton3].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
    });

    it("does not effect units that don't match the provided unitName", () => {
      const skeleton = addEntity(world);
      const guard = addEntity(world);
      const paladin = addEntity(world);

      addComponent(world, Unit, skeleton);
      Unit.name[skeleton] = UnitName.Skeleton;
      addComponent(world, Unit, guard);
      Unit.name[guard] = UnitName.Guard;
      addComponent(world, Unit, paladin);
      Unit.name[paladin] = UnitName.Paladin;

      updateStatsByUnitType(
        world,
        UnitName.Skeleton,
        MOCK_STAT_UPDATE_INCREASE,
      );

      expect(hasComponent(world, UpdateStatsRequest, skeleton)).toBe(true);
      expect(UpdateStatsRequest[skeleton].statUpdates).toEqual(
        MOCK_STAT_UPDATE_INCREASE,
      );
      expect(hasComponent(world, UpdateStatsRequest, guard)).toBe(false);
      expect(hasComponent(world, UpdateStatsRequest, paladin)).toBe(false);
    });

    it("does not break if no units are found", () => {
      updateStatsByUnitType(
        world,
        UnitName.Skeleton,
        MOCK_STAT_UPDATE_INCREASE,
      );
    });
  });

  describe("statUpdateSystem", () => {
    let eid: number;
    let statUpdateSystem: (world: World) => World;

    beforeEach(() => {
      statUpdateSystem = createStatUpdateSystem();
      eid = addEntity(world);
      addComponent(world, Armor, eid);
      addComponent(world, UpdateStatsRequest, eid);
    });

    it("modifies the stat of a unit and removes the UpdateStatsRequest component", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_INCREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(Armor.current[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
    });

    it("does not error and removes the UpdateStatsRequest component if the entity doesn't have the stat", () => {
      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_INCREASE };

      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(true);

      statUpdateSystem(world);

      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
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
      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);

      addComponent(world, UpdateStatsRequest, eid);
      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_INCREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE * 3);
      expect(Armor.current[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE * 3,
      );
      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
    });

    it("handles multiple distinct stat updates at once", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      addComponent(world, MaxHealth, eid);
      MaxHealth.base[eid] = BASE_STAT_VALUE;
      MaxHealth.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = {
        statUpdates: [
          ...MOCK_STAT_UPDATE_INCREASE,
          { stat: StatName.MaxHealth, value: STAT_INCREASE_VALUE },
        ],
      };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(Armor.current[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(MaxHealth.base[eid]).toBe(BASE_STAT_VALUE + STAT_INCREASE_VALUE);
      expect(MaxHealth.current[eid]).toBe(
        BASE_STAT_VALUE + STAT_INCREASE_VALUE,
      );
      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
    });

    it("handles negative stat updates", () => {
      Armor.base[eid] = BASE_STAT_VALUE;
      Armor.current[eid] = BASE_STAT_VALUE;

      UpdateStatsRequest[eid] = { statUpdates: MOCK_STAT_UPDATE_DECREASE };

      statUpdateSystem(world);

      expect(Armor.base[eid]).toBe(BASE_STAT_VALUE + STAT_DECREASE_VALUE);
      expect(Armor.current[eid]).toBe(BASE_STAT_VALUE + STAT_DECREASE_VALUE);
      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
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
      expect(hasComponent(world, UpdateStatsRequest, eid)).toBe(false);
    });
  });
});
