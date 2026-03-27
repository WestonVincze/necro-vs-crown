import { CrownConfig, UnitName } from "../types";
import {
  BehaviorSubject,
  Observable,
  Subscription,
  map,
  tap,
  timer,
} from "rxjs";

export const DEFAULT_CROWN_CONFIG: CrownConfig = {
  maxCoins: 10,
  maxHandSize: 4,
  coinInterval: 1000,
};

/** generates random cards for testing purposes */
export const generateMockCards = (count: number): Card[] => {
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();

    cards.push({
      id: i,
      name: roll > 0.5 ? UnitName.Guard : UnitName.Peasant,
      cost: roll > 0.5 ? 4 : 3,
    });
  }
  return cards;
};

export type Card = {
  id?: number;
  name: UnitName;
  cost: number;
};

type CrownState = {
  coins: number;
  totalCards: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  config: CrownConfig;
};

type Action =
  | { type: "DRAW_CARD" }
  | { type: "PLAY_CARD"; cardId: number; callback: (name: UnitName) => void }
  | { type: "DISCARD_CARD"; cardId: number }
  | { type: "SHUFFLE_DECK" }
  | { type: "ADD_CARDS"; cards: Card[] }
  | { type: "ADD_COINS" }
  | { type: "UPDATE_CONFIG"; config: Partial<CrownConfig> };

const initialState: CrownState = {
  coins: 0,
  totalCards: 0,
  deck: [],
  hand: [],
  discard: [],
  config: DEFAULT_CROWN_CONFIG,
};

/** Utility Functions */
const shuffleCards = (cards: Card[]): Card[] => {
  return [...cards].sort(() => Math.random() - 0.5);
};

const discardCardFromHand = (
  state: CrownState,
  cardId: number,
): CrownState | null => {
  const discardedCard = state.hand.find((card) => card.id === cardId);
  if (!discardedCard) return null;
  const newHand = state.hand.filter((card) => card.id !== cardId);
  return {
    ...state,
    hand: newHand,
    discard: [...state.discard, discardedCard],
  };
};

const drawCardFromDeck = (state: CrownState): CrownState => {
  console.log("drawing card");
  if (state.hand.length >= state.config.maxHandSize) return state;

  if (state.deck.length === 0) {
    if (state.discard.length === 0) return state;
    const newDeck = shuffleCards(state.discard);
    const [drawnCard, ...remainingDeck] = newDeck;
    return {
      ...state,
      deck: remainingDeck,
      hand: [...state.hand, drawnCard],
      discard: [],
    };
  }
  const [drawnCard, ...newDeck] = state.deck;
  return { ...state, deck: newDeck, hand: [...state.hand, drawnCard] };
};

const discardAndDrawCard = (state: CrownState, cardId: number): CrownState => {
  const stateAfterDiscard = discardCardFromHand(state, cardId);

  if (!stateAfterDiscard) return state;

  return drawCardFromDeck(stateAfterDiscard);
};

const updateState = (state: CrownState, action: Action): CrownState => {
  switch (action.type) {
    case "DRAW_CARD":
      return drawCardFromDeck(state);

    case "DISCARD_CARD":
      return discardAndDrawCard(state, action.cardId);

    case "SHUFFLE_DECK":
      return { ...state, deck: shuffleCards(state.deck) };

    case "ADD_CARDS":
      if (!action.cards) return state;

      const newCards = action.cards.map((card, i) => ({
        ...card,
        id: state.totalCards + i + 1,
      }));
      return {
        ...state,
        totalCards: state.totalCards + action.cards.length,
        deck: [...state.deck, ...newCards],
      };

    case "ADD_COINS":
      return {
        ...state,
        coins: Math.min(state.config.maxCoins, state.coins + 1),
      };

    case "PLAY_CARD":
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card || card.cost > state.coins) return state;

      const stateAfterDiscard = discardAndDrawCard(state, action.cardId);

      action.callback?.(card.name);
      return {
        ...stateAfterDiscard,
        coins: state.coins - card.cost,
      };

    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.config },
      };

    default:
      return state;
  }
};

// CLASS
export class CrownStateStore {
  // internal state
  private state$: BehaviorSubject<CrownState>;
  private coinSubscription: Subscription | null = null;
  private paused = false;
  private pausedAt: number | null = null;
  private intervalStart: number = Date.now();

  // Public observables
  readonly hand$: Observable<Card[]>;
  readonly discard$: Observable<Card[]>;
  readonly coins$: Observable<number>;

  constructor() {
    this.state$ = new BehaviorSubject<CrownState>(initialState);

    // Expose slices rather than raw state so callers can't mutate
    this.hand$ = this.state$.pipe(map((s) => s.hand));
    this.discard$ = this.state$.pipe(map((s) => s.discard));
    this.coins$ = this.state$.pipe(map((s) => s.coins));
  }

  // --- Lifecycle ---
  start() {
    this.intervalStart = Date.now();
    this.startCoinTicker();
    return this;
  }

  destroy() {
    this.coinSubscription?.unsubscribe();
    this.state$.complete();
  }

  // --- Actions ---
  addCards(cards: Card[]) {
    this.dispatch({ type: "ADD_CARDS", cards });
  }

  drawCard() {
    this.dispatch({ type: "DRAW_CARD" });
  }

  discardCard(cardId: number) {
    this.dispatch({ type: "DISCARD_CARD", cardId });
  }

  shuffleDeck() {
    this.dispatch({ type: "SHUFFLE_DECK" });
  }

  playCard(cardId: number, callback: (name: UnitName) => void) {
    const state = this.state$.value;
    const card = state.hand.find((c) => c.id === cardId);

    // TODO: consider using error codes
    if (!card) return false;
    if (card.cost > state.coins) return false;
    this.dispatch({ type: "PLAY_CARD", cardId, callback });
    return true;
  }

  updateConfig(config: CrownConfig) {
    this.dispatch({ type: "UPDATE_CONFIG", config });
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.pausedAt = Date.now();
    this.coinSubscription?.unsubscribe();
    this.coinSubscription = null;
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    const interval = this.getState().config.coinInterval;

    // How far through the current interval were we when we paused
    const elapsed = (this.pausedAt! - this.intervalStart) % interval;
    const remaining = interval - elapsed;

    this.pausedAt = null;
    this.intervalStart = Date.now() - elapsed;

    this.startCoinTicker(remaining);
  }

  private startCoinTicker(firstTickDelay = 0) {
    this.coinSubscription = timer(firstTickDelay, 1000)
      .pipe(
        map(() => ({ type: "ADD_COINS" }) as Action),
        tap((action) => this.dispatch(action)),
      )
      .subscribe();
  }

  /** Read current state snapshot — for server-side queries without subscribing */
  getState(): Readonly<CrownState> {
    return this.state$.value;
  }

  // --- Private ---
  private dispatch(action: Action) {
    this.state$.next(updateState(this.state$.value, action));
  }
}
