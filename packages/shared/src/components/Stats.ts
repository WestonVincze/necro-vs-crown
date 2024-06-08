import { Types, defineComponent } from "bitecs";
/**
 * STAT COMPONENTS
 * ===============
 * Each Stat component has a "base" and "current" value
 * base: the initial stat value, as determined by the unit type
 * current: base + the current modifications (items, status effects, etc)
 */
export const Stat = { base: Types.i8, current: Types.i8 };
// TODO: refactor all stats to use whole numbers
export const DecimalStat = { base: Types.f32, current: Types.f32 };

/**
 * ALTERNATIVE APPROACH
 * ====================
 * Single stat component that contains all stats
 * PROS: easier 
 */

/**
 * We need a way to track a unit's current HP, Max HP, and Base Max HP
 * * Health could be split into "CurrentHealth" and "MaxHealth"
 * * Health could be a system or separate component with "MaxHealth" being a Stat Component
 */
export const MaxHealth = defineComponent(Stat);

export const Armor = defineComponent(Stat);

export const HealthRegeneration = defineComponent(DecimalStat);

export const MoveSpeed = defineComponent(DecimalStat);

export const MaxMoveSpeed = defineComponent(DecimalStat);

export const AttackSpeed = defineComponent(Stat);

export const AttackRange = defineComponent(Stat);

export const MaxHit = defineComponent(Stat);

export const DamageBonus = defineComponent(Stat);

export const CritChance = defineComponent(Stat);

export const CritDamage = defineComponent(Stat);

export const CastingSpeed = defineComponent(Stat);

export const CastingRange = defineComponent(Stat);

export const AttackKnockback = defineComponent(Stat);
