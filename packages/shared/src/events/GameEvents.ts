import { Observable, Subject, buffer, distinct, filter } from "rxjs";
import { AIEvent, Faction } from "../types";

interface EntityEvent {
  eid: number;
}

interface HealthChange extends EntityEvent {
  amount: number;
  isCrit?: boolean;
}

interface LevelUpEvent {
  eid: number;
  newLevel: number;
  faction: Faction;
  upgrades: string[];
}

class GameEvents {
  /** SUBJECTS */
  // emitted at the very end of the update loop
  #endOfFrame: Subject<void>;

  // TODO: reject healthChange events that occur after an entity is killed
  #healthChanges: Subject<HealthChange>;

  #onDeath: Subject<EntityEvent>;

  #AIEvents: Subject<AIEvent>;

  #onLevelUp: Subject<LevelUpEvent>;

  constructor() {
    this.#endOfFrame = new Subject<void>();
    this.#healthChanges = new Subject<HealthChange>();
    this.#onDeath = new Subject<EntityEvent>();
    this.#AIEvents = new Subject<AIEvent>();
    this.#onLevelUp = new Subject<LevelUpEvent>();
  }

  /** OBSERVABLES */
  get healthChanges(): Observable<HealthChange> {
    return this.#healthChanges.asObservable();
  }

  get onLevelUp(): Observable<LevelUpEvent> {
    return this.#onLevelUp.asObservable();
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

  /** EMITTERS */
  emitEndOfFrame() {
    this.#endOfFrame.next();
  }

  emitHealthChange(change: HealthChange) {
    this.#healthChanges.next(change);
  }

  emitLevelUp(event: LevelUpEvent): void {
    this.#onLevelUp.next(event);
  }

  emitDeath(eid: number) {
    this.#onDeath.next({ eid });
  }

  emitAIEvent(event: AIEvent) {
    this.#AIEvents.next(event);
  }
}

export const gameEvents = new GameEvents();
