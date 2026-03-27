import {
  addComponent,
  entityExists,
  hasComponent,
  query,
  removeComponent,
} from "bitecs";

import {
  StatName,
  UpdateStatsRequest,
  UnitMeta,
  getStatComponentByName,
} from "../../components";
import { StatUpdate, UnitName } from "../../types";

/**
 * updates the stats for all unit entities with the given `UnitName`
 * also updates `unitUpgrades` for all
 */
export const updateStatsByUnitType = (
  world: World,
  unitName: UnitName,
  updates: StatUpdate[],
) => {
  const units = query(world, [UnitMeta]).filter(
    (eid) => UnitMeta.name[eid] === unitName,
  );

  for (let i = 0; i < units.length; i++) {
    updateStatsByEid(world, units[i], updates);
  }

  const updatesObject = updates.reduce(
    (acc, { stat, value }) => {
      const current = world.unitUpgrades[unitName]?.[stat] || 0;
      acc[stat] = value + current;
      return acc;
    },
    {} as Record<StatName, number>,
  );
  world.unitUpgrades[unitName] = {
    ...world.unitUpgrades[unitName],
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

  if (!hasComponent(world, eid, UpdateStatsRequest)) {
    addComponent(world, eid, UpdateStatsRequest);
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
  const stateUpdateQuery = (world: World) => query(world, [UpdateStatsRequest]);

  const updateStat = (
    world: World,
    eid: number,
    stat: StatName,
    amount: number,
  ) => {
    if (amount === 0) return;

    const statComponent = getStatComponentByName(stat);

    if (!hasComponent(world, eid, statComponent)) {
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
    for (const eid of stateUpdateQuery(world)) {
      for (const { stat, value } of UpdateStatsRequest[eid].statUpdates) {
        updateStat(world, eid, stat, value);
      }
      removeComponent(world, eid, UpdateStatsRequest);
    }

    return world;
  };
};
