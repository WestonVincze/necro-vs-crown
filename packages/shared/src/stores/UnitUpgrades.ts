import { Stats, UnitName } from "../types";

// TODO: improve state management - change from globally accessible object
export const unitUpgrades: Partial<Record<UnitName, Stats>> = {};
