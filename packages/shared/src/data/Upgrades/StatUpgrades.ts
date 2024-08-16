import { getRandomElements } from "$utils";
import { StatName } from "$components";
import { UnitName, Upgrade } from "$types";

export const getUpgradeOptions = (): Upgrade[] => {
  const randomUpgrades = getRandomElements(StatUpgrades, 3);
  return randomUpgrades.map((upgrade, i) => ({ ...upgrade, id: i }));
};

/** Necro Upgrades **/
export const StatUpgrades: Omit<Upgrade, "id">[] = [
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        stat: StatName.MoveSpeed,
        value: 0.15,
      },
      {
        stat: StatName.MaxMoveSpeed,
        value: 0.35,
      },
    ],
  },
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        stat: StatName.HealthRegeneration,
        value: 0.03,
      },
    ],
  },
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        stat: StatName.MaxHealth,
        value: 10,
      },
    ],
  },
  {
    unitName: UnitName.Necromancer,
    statUpdates: [
      {
        stat: StatName.Armor,
        value: 2,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.MoveSpeed,
        value: 0.15,
      },
      {
        stat: StatName.MaxMoveSpeed,
        value: 0.4,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.MaxHit,
        value: 1,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.Armor,
        value: 1,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.AttackBonus,
        value: 1,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.MaxHealth,
        value: 5,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.CritDamage,
        value: 0.5,
      },
    ],
  },
  {
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.CritChance,
        value: 5,
      },
    ],
  },
];
