import {
  addComponent,
  defineQuery,
  entityExists,
  hasComponent,
  query,
  removeComponent,
} from "bitecs";

import {
  Armor,
  AttackBonus,
  Knockback,
  AttackRange,
  AttackSpeed,
  CastingRange,
  CastingSpeed,
  CritChance,
  CritDamage,
  DamageBonus,
  HealthRegeneration,
  MaxHealth,
  MaxHit,
  MaxMoveSpeed,
  MoveSpeed,
  StatName,
  UpdateStatsRequest,
  Unit,
} from "../components";
import { StatUpdate, UnitName } from "../types";

/**
 * updates the stats for all unit entities with the given `UnitName`
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

    const statComponent = getStatByStatName(stat);

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

      /* AoS solution... 
      updateStat(eid, MaxHealth, UpdateStatRequest.MaxHealth[eid]);
      updateStat(eid, Armor, UpdateStatRequest.Armor[eid]);
      updateStat(
        eid,
        HealthRegeneration,
        UpdateStatRequest.HealthRegeneration[eid],
      );
      updateStat(eid, MoveSpeed, UpdateStatRequest.MoveSpeed[eid]);
      updateStat(eid, MaxMoveSpeed, UpdateStatRequest.MaxMoveSpeed[eid]);
      updateStat(eid, AttackBonus, UpdateStatRequest.AttackBonus[eid]);
      updateStat(eid, AttackSpeed, UpdateStatRequest.AttackSpeed[eid]);
      updateStat(eid, AttackRange, UpdateStatRequest.AttackRange[eid]);
      updateStat(eid, MaxHit, UpdateStatRequest.MaxHit[eid]);
      updateStat(eid, DamageBonus, UpdateStatRequest.DamageBonus[eid]);
      updateStat(eid, CritChance, UpdateStatRequest.CritChance[eid]);
      updateStat(eid, CritDamage, UpdateStatRequest.CritDamage[eid]);
      updateStat(eid, CastingSpeed, UpdateStatRequest.CastingSpeed[eid]);
      updateStat(eid, CastingRange, UpdateStatRequest.CastingRange[eid]);
      updateStat(eid, Knockback, UpdateStatRequest.Knockback[eid]);
      */

      removeComponent(world, UpdateStatsRequest, eid);
    }

    return world;
  };
};

const getStatByStatName = (statName: StatName) => {
  switch (statName) {
    case StatName.MaxHealth:
      return MaxHealth;
    case StatName.Armor:
      return Armor;
    case StatName.HealthRegeneration:
      return HealthRegeneration;
    case StatName.MoveSpeed:
      return MoveSpeed;
    case StatName.MaxMoveSpeed:
      return MaxMoveSpeed;
    case StatName.AttackBonus:
      return AttackBonus;
    case StatName.AttackSpeed:
      return AttackSpeed;
    case StatName.AttackRange:
      return AttackRange;
    case StatName.MaxHit:
      return MaxHit;
    case StatName.DamageBonus:
      return DamageBonus;
    case StatName.CritChance:
      return CritChance;
    case StatName.CritDamage:
      return CritDamage;
    case StatName.CastingSpeed:
      return CastingSpeed;
    case StatName.CastingRange:
      return CastingRange;
    case StatName.Knockback:
      return Knockback;
  }
};
