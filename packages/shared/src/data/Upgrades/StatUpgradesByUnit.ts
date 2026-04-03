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
        { name: StatName.MoveSpeed, range: { min: 0.08, max: 0.13 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.18, max: 0.3 } },
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
      id: "m001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "m003",
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      id: "m004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "m005",
      stats: [{ name: StatName.MaxHealth, range: { min: 2, max: 5 } }],
    },
  ],
  [UnitName.Guard]: [
    {
      id: "g001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
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
    {
      id: "g006",
      stats: [{ name: StatName.CritDamage, range: { min: 0.1, max: 0.25 } }],
    },
  ],
  [UnitName.Archer]: [
    {
      id: "a001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "a002",
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.1, max: 0.15 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.2, max: 0.4 } },
      ],
    },
    {
      id: "a003",
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      id: "a004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "a005",
      stats: [{ name: StatName.AttackRange, range: { min: 6, max: 122 } }],
    },
    {
      id: "a006",
      stats: [{ name: StatName.CritChance, range: { min: 1, max: 3 } }],
    },
    {
      id: "a006",
      stats: [{ name: StatName.CritDamage, range: { min: 0.1, max: 0.25 } }],
    },
  ],
  [UnitName.Doppelsoldner]: [
    {
      id: "d001",
      stats: [{ name: StatName.Armor, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "d002",
      stats: [
        { name: StatName.MoveSpeed, range: { min: 0.2, max: 0.3 } },
        { name: StatName.MaxMoveSpeed, range: { min: 0.3, max: 0.6 } },
      ],
    },
    {
      id: "d003",
      stats: [{ name: StatName.MaxHit, range: { min: 3, max: 6 } }],
    },
    {
      id: "d004",
      stats: [{ name: StatName.AttackBonus, range: { min: 0.5, max: 1 } }],
    },
    {
      id: "d005",
      stats: [{ name: StatName.MaxHealth, range: { min: 2, max: 5 } }],
    },
    {
      id: "d006",
      stats: [{ name: StatName.CritChance, range: { min: 1, max: 3 } }],
    },
    {
      id: "d006",
      stats: [{ name: StatName.CritDamage, range: { min: 0.1, max: 0.25 } }],
    },
  ],
  [UnitName.Paladin]: [
    {
      id: "p001",
      stats: [{ name: StatName.Armor, range: { min: 0.8, max: 1.5 } }],
    },
    {
      id: "p005",
      stats: [{ name: StatName.MaxHealth, range: { min: 20, max: 50 } }],
    },
  ],
};
