import { Subject } from "rxjs";
import { Faction, type Vector2 } from "../types";

export interface HitSplatEvent {
  amount: number;
  isCrit: number;
  position: Vector2;
  colorSet: "red" | "purple";
}

export interface GameOverEvent {
  winner: Faction;
  time: number;
}

/**
 * Game Events class
 * * must not interact with ECS state *
 * Event bus that acts as the bridge between state and UI
 */
export class GameEvents {
  readonly hitSplat$ = new Subject<HitSplatEvent>();
  readonly gameOver$ = new Subject<GameOverEvent>();
}
