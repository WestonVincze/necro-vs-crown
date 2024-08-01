import { StatName } from "../../components";
import { UnitName, Upgrade } from "../../types";

export const StatUpgrades: Upgrade[] = [
  {
    id: 1,
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.MaxHealth,
        value: 5,
      },
    ],
  },
  {
    id: 2,
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.MaxMoveSpeed,
        value: 1,
      },
      {
        stat: StatName.MoveSpeed,
        value: 1,
      },
    ],
  },
  {
    id: 3,
    unitName: UnitName.Skeleton,
    statUpdates: [
      {
        stat: StatName.Armor,
        value: 1,
      },
    ],
  },
];
