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
 *
 * @param statName the name of the desired stat
 * @returns the related Stat component
 */
export const getStatComponentByName = (statName: StatName) => {
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

/** single component approach - not used **/
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

const BaseStats = defineComponent(AllStats);
