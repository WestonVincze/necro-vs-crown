import type { Upgrade } from "@necro-crown/shared";
import { writable } from "svelte/store";

type UpgradeEvent = {
  options: Upgrade[];
  duration: number;
  onSelect: (optionId: number) => void;
};

export const pendingUpgrade = writable<UpgradeEvent | null>(null);

export const isPaused = writable(false);
