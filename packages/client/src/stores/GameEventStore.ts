import type { StatUpdate, UnitName } from "@necro-crown/shared";
import { writable } from "svelte/store";
// only upgrade event for now

type BaseUpgrade = {
  id: number;
  label?: string;
  description?: string;
};

type Upgrade = BaseUpgrade &
  (
    | { type: "stat"; unitName: UnitName; statUpdates: StatUpdate[] }
    | { type: "addCard"; unitName: UnitName }
  );

type UpgradeEvent = {
  options: Upgrade[];
  duration: number;
  onSelect: (optionId: number) => void;
};

export const pendingUpgrade = writable<UpgradeEvent | null>(null);

export const isPaused = writable(false);
