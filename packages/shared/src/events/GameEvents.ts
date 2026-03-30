import { Subject } from "rxjs";
import { LegacyUpgrade, type Vector2 } from "../types";

export interface HitSplatEvent {
  amount: number;
  isCrit: number;
  position: Vector2;
  colorSet: "red" | "purple";
}

interface UpgradeRequestEvent {
  upgrades: LegacyUpgrade[];
}

/**
 * Game Events class
 * * must not interact with ECS state *
 * Event bus that acts as the bridge between state and UI
 */
export class GameEvents {
  readonly hitSplat$ = new Subject<HitSplatEvent>();
  readonly upgradeRequest$ = new Subject<UpgradeRequestEvent>();
}
