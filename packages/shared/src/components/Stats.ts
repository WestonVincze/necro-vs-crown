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
  AttackKnockback,
}

export const AddToStat = defineComponent({
  stat: Types.ui8,
  value: Types.f32,
});

/** Stat Components */
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

export const CritChance = defineComponent(Stat);

export const CritDamage = defineComponent(Stat);

export const CastingSpeed = defineComponent(Stat);

export const CastingRange = defineComponent(Stat);

export const AttackKnockback = defineComponent(Stat);
