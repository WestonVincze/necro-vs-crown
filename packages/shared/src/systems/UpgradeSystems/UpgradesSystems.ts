import {
  addComponent,
  defineEnterQueue,
  defineQuery,
  entityExists,
  removeComponent,
} from "bitecs";
import { updateStatsByUnitType } from "..";
import { gameEvents, UpgradeSelectEvent } from "../../events";
import { Player, SelectedUpgrade, UpgradeRequest } from "../../components";

/**
 * Fulfill's `UpgradeRequest` when an entity has a `SelectedUpgrade`
 */
export const createUpgradeSelectionSystem = () => {
  const query = defineQuery([UpgradeRequest, SelectedUpgrade]);

  return (world: World) => {
    const entities = query(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const upgrades = UpgradeRequest[eid].upgrades;

      const selectedUpgrade = upgrades.find(
        (upgrade) => upgrade.id === SelectedUpgrade.upgradeId[eid],
      );

      if (!selectedUpgrade) {
        console.warn(
          `${eid} failed to upgrade: SelectedUpgrade contains an invalid upgradeId.`,
        );
        continue;
      }

      // TODO: support different types of upgrade requests
      updateStatsByUnitType(
        world,
        selectedUpgrade.unitName,
        selectedUpgrade.statUpdates,
      );

      removeComponent(world, UpgradeRequest, eid);
      removeComponent(world, SelectedUpgrade, eid);
    }

    return world;
  };
};

/**
 * Emits an `UpgradeOptionsEvent` event through `gameEvents` when a `Player` entity has and `UpgradeRequest`
 */
export const createEmitUpgradeRequestEventSystem = () => {
  const playerUpgradeQuery = defineQuery([UpgradeRequest, Player]);
  const playerUpgradeEnterQueue = defineEnterQueue(playerUpgradeQuery);

  return (world: World) => {
    const playerEntitiesEntered = playerUpgradeEnterQueue(world);
    for (let i = 0; i < playerEntitiesEntered.length; i++) {
      const eid = playerEntitiesEntered[i];
      gameEvents.emitUpgradeRequest({
        eid,
        upgrades: UpgradeRequest[eid].upgrades,
      });
    }

    return world;
  };
};

/**
 * pools `UpgradeSelectEvent` events from `onUpgradeSelect` in a queue
 */
export const createHandleUpgradeSelectEventSystem = () => {
  const upgradeEventQueue: UpgradeSelectEvent[] = [];

  gameEvents.onUpgradeSelect.subscribe((event) => {
    upgradeEventQueue.push(event);
  });

  return (world: World) => {
    while (upgradeEventQueue.length > 0) {
      const { eid, upgradeId } =
        upgradeEventQueue.shift() as UpgradeSelectEvent;

      if (!entityExists(world, eid)) {
        console.warn(
          `Attempted to process upgrade for ${eid}, but it does not exist.`,
        );
        continue;
      }

      addComponent(world, SelectedUpgrade, eid);
      SelectedUpgrade.upgradeId[eid] = upgradeId;
    }

    return world;
  };
};

// TODO: create "upgradeSelect" system for AI

enum UpgradeType {
  StatIncrease,
  StatExchange,
}

const Upgrades = {
  [UpgradeType.StatIncrease]: () => updateStatsByUnitType,
};

/**
 * upgrade event emitted
 * svelte subscribes to event
 *
 *
 * upgrade stats
 * - add upgradeOptions component to entity
 *   - upgrade contains a key, an upgrade type, and a value
 * - handleUpgradeSystem
 *   - query for upgrade options
 *   - if player, emit event
 *   - else, select at random (for now)
 * - add selectedUpgrade to entity
 *   - as player, an event is emitted after selection is made
 * - processUpgradeSystem queries for UpgradeRequest and SelectedUpgrade, then it
 */
