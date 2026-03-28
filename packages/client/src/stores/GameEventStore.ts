import { writable } from "svelte/store";
// only upgrade event for now

type UpgradeOption = {
  id: string;
  label: string;
  description: string;
};

type UpgradeEvent = {
  options: UpgradeOption[];
  duration: number;
  onSelect: (optionId: string) => void;
};

export const pendingUpgrade = writable<UpgradeEvent | null>(null);
