import { Observable, Subject, buffer, distinct, filter } from "rxjs";
import { AIEvent, Upgrade } from "../types";

export interface UpgradeRequestEvent {
  eid: number;
  upgrades: Upgrade[];
}

// TODO: handle other types of upgrades
export interface UpgradeSelectEvent {
  eid: number;
  upgradeId: number;
}

interface TogglePauseEvent {
  remainingPauseTime?: number;
}

class GameEvents {
  /** SUBJECTS */
  #gameOver: Subject<void>;

  #AIEvents: Subject<AIEvent>;

  #upgradeRequest: Subject<UpgradeRequestEvent>;

  #upgradeSelect: Subject<UpgradeSelectEvent>;

  // TODO: add separate pause/resume functions, perhaps change to BehaviorSubject
  #togglePause: Subject<TogglePauseEvent>;

  constructor() {
    this.#gameOver = new Subject<void>();
    this.#AIEvents = new Subject<AIEvent>();
    this.#upgradeRequest = new Subject<UpgradeRequestEvent>();
    this.#upgradeSelect = new Subject<UpgradeSelectEvent>();
    this.#togglePause = new Subject<TogglePauseEvent>();
  }

  /** OBSERVABLES */
  get onUpgradeRequest(): Observable<UpgradeRequestEvent> {
    return this.#upgradeRequest.asObservable();
  }

  get onUpgradeSelect(): Observable<UpgradeSelectEvent> {
    return this.#upgradeSelect.asObservable();
  }

  get AIEvents(): Observable<AIEvent> {
    return this.#AIEvents.asObservable();
  }

  get onTogglePause(): Observable<TogglePauseEvent> {
    return this.#togglePause.asObservable();
  }

  get onGameOver(): Observable<void> {
    return this.#gameOver.asObservable();
  }

  /** EMITTERS */
  emitGameOver() {
    this.#gameOver.next();
  }

  emitUpgradeRequest(event: UpgradeRequestEvent): void {
    this.#upgradeRequest.next(event);
  }

  emitUpgradeSelect(event: UpgradeSelectEvent): void {
    this.#upgradeSelect.next(event);
  }

  emitAIEvent(event: AIEvent) {
    this.#AIEvents.next(event);
  }

  emitTogglePause(event?: TogglePauseEvent) {
    this.#togglePause.next(event || {});
  }
}

export const gameEvents = new GameEvents();
