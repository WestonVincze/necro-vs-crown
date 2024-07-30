import { Types, defineComponent } from "bitecs";
/**
 * STAT COMPONENTS
 * ===============
 * Each Stat component has a "base" and "current" value
 * base: the initial stat value, as determined by the unit type
 * current: base + the current modifications (items, status effects, etc)
 */

const Stat = { base: Types.i32, current: Types.i32 };
// TODO: refactor all stats to use whole numbers
const DecimalStat = { base: Types.f32, current: Types.f32 };

export enum StatName {
  MaxHealth,
  Armor,
  HealthRegeneration,
  MoveSpeed,
  MaxMoveSpeed,
  AttackBonus,
  AttackSpeed,
  AttackRange,
  MaxHit,
  DamageBonus,
  CritChance,
  CritDamage,
  CastingSpeed,
  CastingRange,
  Knockback,
}

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
    stat: StatName;
    value: number;
  }[];
}[];

/** Stat Components **/
export const MaxHealth = defineComponent(Stat);

export const Armor = defineComponent(Stat);

export const HealthRegeneration = defineComponent(DecimalStat);

export const MoveSpeed = defineComponent(DecimalStat);

export const MaxMoveSpeed = defineComponent(DecimalStat);

export const AttackBonus = defineComponent(Stat);

export const AttackSpeed = defineComponent(Stat);

export const AttackRange = defineComponent(Stat);

export const MaxHit = defineComponent(Stat);

export const DamageBonus = defineComponent(Stat);

export const CritChance = defineComponent(DecimalStat);

export const CritDamage = defineComponent(DecimalStat);

export const CastingSpeed = defineComponent(Stat);

export const CastingRange = defineComponent(Stat);

export const Knockback = defineComponent(Stat);

const AllStats = {
  MaxHealth: Types.i32,
  Armor: Types.i32,
  HealthRegeneration: Types.f32,
  MoveSpeed: Types.f32,
  MaxMoveSpeed: Types.f32,
  AttackBonus: Types.i32,
  AttackSpeed: Types.i32,
  AttackRange: Types.i32,
  MaxHit: Types.i32,
  DamageBonus: Types.i32,
  CritChance: Types.f32,
  CritDamage: Types.f32,
  CastingSpeed: Types.i32,
  CastingRange: Types.i32,
  Knockback: Types.i32,
};

export const BaseStats = defineComponent(AllStats);
