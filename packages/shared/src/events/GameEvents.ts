import { Observable, Subject, buffer, distinct, filter } from "rxjs";
import { AIEvent, Upgrade } from "../types";

interface EntityEvent {
  eid: number;
}

interface HealthChange extends EntityEvent {
  amount: number;
  isCrit?: boolean;
}

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

// TODO: refactor health and death systems into ECS components instead of subjects
class GameEvents {
  /** SUBJECTS */
  // emitted at the very end of the update loop
  #endOfFrame: Subject<void>;

  // TODO: reject healthChange events that occur after an entity is killed
  #healthChanges: Subject<HealthChange>;

  #onDeath: Subject<EntityEvent>;

  #AIEvents: Subject<AIEvent>;

  #upgradeRequest: Subject<UpgradeRequestEvent>;

  #upgradeSelect: Subject<UpgradeSelectEvent>;

  // TODO: add separate pause/resume functions, perhaps change to BehaviorSubject
  #togglePause: Subject<TogglePauseEvent>;

  constructor() {
    this.#endOfFrame = new Subject<void>();
    this.#healthChanges = new Subject<HealthChange>();
    this.#onDeath = new Subject<EntityEvent>();
    this.#AIEvents = new Subject<AIEvent>();
    this.#upgradeRequest = new Subject<UpgradeRequestEvent>();
    this.#upgradeSelect = new Subject<UpgradeSelectEvent>();
    this.#togglePause = new Subject<TogglePauseEvent>();
  }

  /** OBSERVABLES */
  get healthChanges(): Observable<HealthChange> {
    return this.#healthChanges.asObservable();
  }

  get onUpgradeRequest(): Observable<UpgradeRequestEvent> {
    return this.#upgradeRequest.asObservable();
  }

  get onUpgradeSelect(): Observable<UpgradeSelectEvent> {
    return this.#upgradeSelect.asObservable();
  }

  /**
   * this should likely never be used - see "bufferedOnDeath"
   */
  get onDeath(): Observable<EntityEvent> {
    return this.#onDeath.asObservable();
  }

  get bufferedOnDeath(): Observable<EntityEvent[]> {
    return this.#onDeath.pipe(
      distinct((event) => event.eid),
      buffer(this.#endOfFrame),
      filter((events) => events.length > 0),
    );
  }

  get AIEvents(): Observable<AIEvent> {
    return this.#AIEvents.asObservable();
  }

  get onTogglePause(): Observable<TogglePauseEvent> {
    return this.#togglePause.asObservable();
  }

  /** EMITTERS */
  emitEndOfFrame() {
    this.#endOfFrame.next();
  }

  emitHealthChange(change: HealthChange) {
    this.#healthChanges.next(change);
  }

  emitUpgradeRequest(event: UpgradeRequestEvent): void {
    this.#upgradeRequest.next(event);
  }

  emitUpgradeSelect(event: UpgradeSelectEvent): void {
    this.#upgradeSelect.next(event);
  }

  emitDeath(eid: number) {
    this.#onDeath.next({ eid });
  }

  emitAIEvent(event: AIEvent) {
    this.#AIEvents.next(event);
  }

  emitTogglePause(event?: TogglePauseEvent) {
    this.#togglePause.next(event || {});
  }
}

export const gameEvents = new GameEvents();
