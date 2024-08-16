import {
  addComponent,
  defineQuery,
  entityExists,
  hasComponent,
  query,
  removeComponent,
} from "bitecs";

import {
  StatName,
  UpdateStatsRequest,
  Unit,
  getStatComponentByName,
} from "$components";
import { StatUpdate, UnitName } from "$types";
import { unitUpgrades } from "$stores";

/**
 * updates the stats for all unit entities with the given `UnitName`
 * also updates `unitUpgrades` for all
 */
export const updateStatsByUnitType = (
  world: World,
  unitName: UnitName,
  updates: StatUpdate[],
) => {
  const units = query(world, [Unit]).filter(
    (eid) => Unit.name[eid] === unitName,
  );

  for (let i = 0; i < units.length; i++) {
    updateStatsByEid(world, units[i], updates);
  }

  const updatesObject = updates.reduce(
    (acc, { stat, value }) => {
      const current = unitUpgrades[unitName]?.[stat] || 0;
      acc[stat] = value + current;
      return acc;
    },
    {} as Record<StatName, number>,
  );
  unitUpgrades[unitName] = {
    ...unitUpgrades[unitName],
    ...updatesObject,
  };
};

export const updateStatsByEid = (
  world: World,
  eid: number,
  updates: StatUpdate[],
) => {
  if (!entityExists(world, eid)) {
    console.warn(`StatUpdate was requested for ${eid}, but it does not exist.`);
    return;
  }

  if (!hasComponent(world, UpdateStatsRequest, eid)) {
    addComponent(world, UpdateStatsRequest, eid);
    UpdateStatsRequest[eid] = { statUpdates: [] };
  }

  for (const { stat, value } of updates) {
    const statIndex = UpdateStatsRequest[eid].statUpdates.findIndex(
      (update) => update.stat === stat,
    );

    if (statIndex === -1) {
      UpdateStatsRequest[eid].statUpdates.push({ stat, value });
    } else {
      UpdateStatsRequest[eid].statUpdates[statIndex].value += value;
    }
  }
};

export const createStatUpdateSystem = () => {
  const query = defineQuery([UpdateStatsRequest]);

  const updateStat = (
    world: World,
    eid: number,
    stat: StatName,
    amount: number,
  ) => {
    if (amount === 0) return;

    const statComponent = getStatComponentByName(stat);

    if (!hasComponent(world, statComponent, eid)) {
      console.warn(
        `${eid} attempted to update ${StatName[stat]}, but no component was found.`,
      );
      return;
    }

    statComponent.base[eid] = Math.max(statComponent.base[eid] + amount, 0);
    statComponent.current[eid] = Math.max(
      statComponent.current[eid] + amount,
      0,
    );
  };

  return (world: World) => {
    for (const eid of query(world)) {
      for (const { stat, value } of UpdateStatsRequest[eid].statUpdates) {
        updateStat(world, eid, stat, value);
      }
      removeComponent(world, UpdateStatsRequest, eid);
    }

    return world;
  };
};
