import { UnitName } from "../types";

type CardData = {
  cost: number;
};

export const CardData: Partial<Record<UnitName, CardData>> = {
  [UnitName.Peasant]: {
    cost: 2,
  },
  [UnitName.Militia]: {
    cost: 3,
  },
  [UnitName.Guard]: {
    cost: 4,
  },
  [UnitName.Archer]: {
    cost: 5,
  },
  [UnitName.Doppelsoldner]: {
    cost: 5,
  },
  [UnitName.Paladin]: {
    cost: 8,
  },
};
