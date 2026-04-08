import {
  Armor,
  AttackBonus,
  AttackRange,
  AttackSpeed,
  CastingRange,
  CastingSpeed,
  CritChance,
  CritDamage,
  DamageBonus,
  HealthRegeneration,
  Knockback,
  MaxHealth,
  MaxHit,
  MaxMoveSpeed,
  MoveSpeed,
} from "../components";
import { StatName } from "../types";

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
