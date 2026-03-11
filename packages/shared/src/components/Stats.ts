/**
 * STAT COMPONENTS
 * ===============
 * Each Stat component has a "base" and "current" value
 * base: the initial stat value, as determined by the unit type
 * current: base + the current modifications (items, status effects, etc)
 */

const Stat = { base: [] as number[], current: [] as number[] };
// TODO: refactor all stats to use whole numbers
const DecimalStat = { base: [] as number[], current: [] as number[] };

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
export const MaxHealth = { ...Stat };
export const Armor = { ...Stat };
export const HealthRegeneration = { ...DecimalStat };
export const MoveSpeed = { ...DecimalStat };
export const MaxMoveSpeed = { ...DecimalStat };
export const AttackBonus = { ...Stat };
export const AttackSpeed = { ...Stat };
export const AttackRange = { ...Stat };
export const MaxHit = { ...Stat };
export const DamageBonus = { ...Stat };
export const CritChance = { ...DecimalStat };
export const CritDamage = { ...DecimalStat };
export const CastingSpeed = { ...Stat };
export const CastingRange = { ...Stat };
export const Knockback = { ...Stat };

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

const BaseStats = { ...AllStats };
