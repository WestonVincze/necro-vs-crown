import { getRandomElements } from "../../utils";
import { StatName, UnitName, LegacyUpgrade } from "../../types";

export const getUpgradeOptions = (): LegacyUpgrade[] => {
  const randomUpgrades = getRandomElements(StatUpgrades, 3);
  return randomUpgrades.map((upgrade, i) => ({ ...upgrade, id: i }));
};

/** Necro Upgrades **/
export const StatUpgrades: Omit<LegacyUpgrade, "id">[] = [
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        name: StatName.MoveSpeed,
        value: 0.15,
      },
      {
        name: StatName.MaxMoveSpeed,
        value: 0.35,
      },
    ],
  },
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        name: StatName.HealthRegeneration,
        value: 0.03,
      },
    ],
  },
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        name: StatName.MaxHealth,
        value: 10,
      },
    ],
  },
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        name: StatName.Armor,
        value: 2,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.MoveSpeed,
        value: 0.15,
      },
      {
        name: StatName.MaxMoveSpeed,
        value: 0.4,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.MaxHit,
        value: 1,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.Armor,
        value: 1,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.AttackBonus,
        value: 1,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.MaxHealth,
        value: 5,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.CritDamage,
        value: 0.5,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        name: StatName.CritChance,
        value: 5,
      },
    ],
  },
];
