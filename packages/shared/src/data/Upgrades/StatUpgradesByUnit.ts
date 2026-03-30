import { StatName } from "../../components";
import { UnitName } from "../../types";

export type StatUpgradeRange = { min: number; max: number };

type StatEntry = {
  name: StatName;
  range: StatUpgradeRange;
};

type StatUpgradeDefinition = {
  stats: StatEntry[];
};

export const validStatsByUnitType: Partial<
  Record<UnitName, StatUpgradeDefinition[]>
> = {
  /** Necro Units */
  [UnitName.Necromancer]: [
    {
      stats: [
        { name: StatName.HealthRegeneration, range: { min: 0.1, max: 0.4 } },
      ],
    },
    {
      stats: [{ name: StatName.MaxHealth, range: { min: 10, max: 30 } }],
    },
    {
      stats: [{ name: StatName.Armor, range: { min: 1, max: 3 } }],
    },
  ],
  [UnitName.Skeleton]: [
    {
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      stats: [{ name: StatName.MaxHit, range: { min: 6, max: 12 } }],
    },
    {
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      stats: [{ name: StatName.MaxHealth, range: { min: 5, max: 25 } }],
    },
    {
      stats: [{ name: StatName.CritChance, range: { min: 2, max: 5 } }],
    },
    {
      stats: [{ name: StatName.CritDamage, range: { min: 0.1, max: 0.5 } }],
    },
  ],
  /** Crown Units */
  [UnitName.Peasant]: [
    {
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      stats: [{ name: StatName.MaxHealth, range: { min: 2, max: 5 } }],
    },
  ],
  [UnitName.Guard]: [
    {
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      stats: [{ name: StatName.MaxHealth, range: { min: 2, max: 5 } }],
    },
    {
      stats: [{ name: StatName.CritChance, range: { min: 1, max: 3 } }],
    },
  ],
};
