import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createUpgradeSelectionSystem,
  createEmitUpgradeRequestEventSystem,
  createHandleUpgradeSelectEventSystem,
} from "./UpgradesSystems";
import {
  addComponent,
  addEntity,
  createWorld,
  hasComponent,
  removeComponent,
} from "bitecs";
import { gameEvents } from "../../events";
import {
  Player,
  SelectedUpgrade,
  StatName,
  UpgradeRequest,
} from "../../components";
import { UnitName, Upgrade } from "types";

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

describe("Upgrade Systems", () => {
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

      addComponent(world, UpgradeRequest, eid);
      addComponent(world, SelectedUpgrade, eid);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };
      SelectedUpgrade.upgradeId[eid] = upgradeId;

      system(world);

      expect(hasComponent(world, UpgradeRequest, eid)).toBe(false);
      expect(hasComponent(world, SelectedUpgrade, eid)).toBe(false);
    });

    /*
    it("should do nothing if the upgradeId is not found", () => {
      const system = createUpgradeSelectionSystem();
      const eid = addEntity(world);
      const upgradeId = 5;

      addComponent(world, UpgradeRequest, eid);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };

      system(world);

      expect(SelectedUpgrade.upgradeId[eid]).toBe(upgradeId);
    });
    */
  });

  describe("createEmitUpgradeRequestEventSystem", () => {
    it("should emit upgrade request event", () => {
      const system = createEmitUpgradeRequestEventSystem();
      const eid = addEntity(world);

      addComponent(world, UpgradeRequest, eid);
      addComponent(world, Player, eid);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };

      const emitSpy = vi.spyOn(gameEvents.onUpgradeRequest, "subscribe");

      system(world);

      expect(emitSpy).toHaveBeenCalledWith({
        entityId: eid,
        upgrades: MOCK_UPGRADES,
      });
    });
  });

  describe("createHandleUpgradeSelectEventSystem", () => {
    it("should handle upgrade select event", () => {
      const system = createHandleUpgradeSelectEventSystem();
      const eid = addEntity(world);
      const upgradeId = 1;

      addComponent(world, UpgradeRequest, eid);
      UpgradeRequest[eid] = { upgrades: MOCK_UPGRADES };

      gameEvents.emitUpgradeSelect({ eid, upgradeId });

      system(world);

      expect(SelectedUpgrade.upgradeId[eid]).toBe(upgradeId);
    });
  });
});
