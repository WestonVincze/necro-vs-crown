import { StatName } from "../../components";
import { UnitName } from "../../types";

export type StatUpgradeRange = { min: number; max: number };

type StatEntry = {
  name: StatName;
  range: StatUpgradeRange;
};

type StatUpgradeDefinition = {
  id: string;
  stats: StatEntry[];
};

export const validStatsByUnitType: Partial<
  Record<UnitName, StatUpgradeDefinition[]>
> = {
  /** Necro Units */
  [UnitName.Necromancer]: [
    {
      id: "n001",
      stats: [
        { name: StatName.HealthRegeneration, range: { min: 0.1, max: 0.4 } },
      ],
    },
    {
      id: "n002",
      stats: [{ name: StatName.MaxHealth, range: { min: 10, max: 30 } }],
    },
    {
      id: "n003",
      stats: [{ name: StatName.Armor, range: { min: 1, max: 3 } }],
    },
  ],
  [UnitName.Skeleton]: [
    {
      id: "sk001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "sk002",
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      id: "sk003",
      stats: [{ name: StatName.MaxHit, range: { min: 6, max: 12 } }],
    },
    {
      id: "sk004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "sk005",
      stats: [{ name: StatName.MaxHealth, range: { min: 5, max: 25 } }],
    },
    {
      id: "sk006",
      stats: [{ name: StatName.CritChance, range: { min: 2, max: 5 } }],
    },
    {
      id: "sk007",
      stats: [{ name: StatName.CritDamage, range: { min: 0.1, max: 0.5 } }],
    },
  ],
  /** Crown Units */
  [UnitName.Peasant]: [
    {
      id: "p001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "p002",
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      id: "p003",
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      id: "p004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "p005",
      stats: [{ name: StatName.MaxHealth, range: { min: 2, max: 5 } }],
    },
  ],
  [UnitName.Militia]: [
    {
      id: "p004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
  ],
  [UnitName.Guard]: [
    {
      id: "g001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "g002",
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      id: "g003",
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      id: "g004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "g005",
      stats: [{ name: StatName.MaxHealth, range: { min: 2, max: 5 } }],
    },
    {
      id: "g006",
      stats: [{ name: StatName.CritChance, range: { min: 1, max: 3 } }],
    },
  ],
};
