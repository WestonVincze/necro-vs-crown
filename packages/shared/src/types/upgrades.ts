import { StatName } from "../components";
import { UnitName } from "./units";

export type StatUpdate = {
  name: StatName;
  value: number;
};

export type LegacyUpgrade = {
  id: number;
  unitName: UnitName;
  statUpdates: StatUpdate[];
  title?: string;
  description?: string;
};

type BaseUpgrade = {
  id: number;
  // label?: string;
  // description?: string;
};

type StatUpgrade = { unitName: UnitName; statUpdates: StatUpdate[] };
type AddCardUpgrade = { unitName: UnitName; cost: number };

export type Upgrade = BaseUpgrade &
  (({ type: "stat" } & StatUpgrade) | ({ type: "addCard" } & AddCardUpgrade));
