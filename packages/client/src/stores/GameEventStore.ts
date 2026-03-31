import type { Faction, Upgrade } from "@necro-crown/shared";
import { writable } from "svelte/store";

/**
 * Event Layer between client game instance and UI
 */

type UpgradeEvent = {
  options: Upgrade[];
  duration: number;
  onSelect: (optionId: string) => void;
};
type GameOverEvent = {
  winner: Faction;
  time: number;
};

export const pendingUpgrade = writable<UpgradeEvent | null>(null);

export const isPaused = writable(false);

export const gameOver = writable<GameOverEvent | null>(null);
