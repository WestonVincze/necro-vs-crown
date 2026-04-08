/**
 * STAT COMPONENTS
 * ===============
 * Each Stat component has a "base" and "current" value
 * base: the initial stat value, as determined by the unit type
 * current: base + the current modifications (items, status effects, etc)
 */

import { StatName } from "../types";

const createStat = () => ({ base: [] as number[], current: [] as number[] });

/** Stat Components **/
export const MaxHealth = createStat();
export const Armor = createStat();
export const HealthRegeneration = createStat();
export const MoveSpeed = createStat();
export const MaxMoveSpeed = createStat();
export const AttackBonus = createStat();
export const AttackSpeed = createStat();
export const AttackRange = createStat();
export const MaxHit = createStat();
export const DamageBonus = createStat();
export const CritChance = createStat();
export const CritDamage = createStat();
export const CastingSpeed = createStat();
export const CastingRange = createStat();
export const Knockback = createStat();

/**
 * updates only the current value of a stat until `timeUntilReset` reaches 0, at which point the stat reverts to its base value
 */
export const UpdateCurrentStats = [] as {
  statUpdates: {
    stat: StatName;
    value: number;
    timeUntilReset: number;
  }[];
}[];

/**
 * updates current and base values of a stat
 */
export const UpdateStatsRequest = [] as {
  statUpdates: {
    name: StatName;
    value: number;
  }[];
}[];

/** single component approach - not used **/
const AllStats = {
  MaxHealth: [] as number[],
  Armor: [] as number[],
  HealthRegeneration: [] as number[],
  MoveSpeed: [] as number[],
  MaxMoveSpeed: [] as number[],
  AttackBonus: [] as number[],
  AttackSpeed: [] as number[],
  AttackRange: [] as number[],
  MaxHit: [] as number[],
  DamageBonus: [] as number[],
  CritChance: [] as number[],
  CritDamage: [] as number[],
  CastingSpeed: [] as number[],
  CastingRange: [] as number[],
  Knockback: [] as number[],
};
