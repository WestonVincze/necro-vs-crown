import { StatName } from "$components";
import { UnitName } from "./units";

export type StatUpdate = {
  stat: StatName;
  value: number;
};

export type Upgrade = {
  id: number;
  unitName: UnitName;
  statUpdates: StatUpdate[];
  title?: string;
  description?: string;
};
