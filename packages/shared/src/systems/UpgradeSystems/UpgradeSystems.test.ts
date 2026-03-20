import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createUpgradeSelectionSystem,
  createEmitUpgradeRequestEventSystem,
  createHandleUpgradeSelectEventSystem,
} from "./UpgradesSystems";
import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { legacyGameEvents } from "../../events";
import {
  Player,
  SelectedUpgrade,
  StatName,
  UpgradeRequest,
} from "../../components";
import { UnitName, Upgrade } from "../../types";

const MOCK_UPGRADES: Upgrade[] = [
  {
    id: 1,
    unitName: UnitName.Skeleton,
    statUpdates: [{ stat: StatName.Armor, value: 1 }],
  },
  {
    id: 2,
    unitName: UnitName.Skeleton,
    statUpdates: [{ stat: StatName.Armor, value: 2 }],
  },
  {
    id: 3,
    unitName: UnitName.Skeleton,
    statUpdates: [{ stat: StatName.Armor, value: 3 }],
  },
];

describe("UpgradeSystems", () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
    vi.clearAllMocks();
  });

  describe("createUpgradeSelectionSystem", () => {
    it("should add SelectedUpgrade component to entity", () => {
      const system = createUpgradeSelectionSystem();
      const eid = addEntity(world);
      const upgradeId = 1;

      addComponent(world, eid, UpgradeRequest);
      addComponent(world, eid, SelectedUpgrade);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };
      SelectedUpgrade.upgradeId[eid] = upgradeId;

      system(world);

      expect(hasComponent(world, eid, UpgradeRequest)).toBe(false);
      expect(hasComponent(world, eid, SelectedUpgrade)).toBe(false);
    });
  });

  describe("createEmitUpgradeRequestEventSystem", () => {
    it("should emit upgrade request event", () => {
      const system = createEmitUpgradeRequestEventSystem(world);
      const eid = addEntity(world);

      addComponent(world, eid, UpgradeRequest);
      addComponent(world, eid, Player);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };

      const emitSpy = vi.spyOn(legacyGameEvents, "emitUpgradeRequest");

      system(world);

      expect(emitSpy).toHaveBeenCalledWith({
        eid,
        upgrades: MOCK_UPGRADES,
      });
    });
  });

  describe("createHandleUpgradeSelectEventSystem", () => {
    it("should handle upgrade select event", () => {
      const system = createHandleUpgradeSelectEventSystem();
      const eid = addEntity(world);
      const upgradeId = 1;

      addComponent(world, eid, UpgradeRequest);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };

      legacyGameEvents.emitUpgradeSelect({ eid, upgradeId });

      system(world);

      expect(SelectedUpgrade.upgradeId[eid]).toBe(upgradeId);
    });
  });
});
