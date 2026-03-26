import { UnitName } from "../types";
import {
  BehaviorSubject,
  Observable,
  interval,
  map,
  startWith,
  tap,
} from "rxjs";

const COIN_INCREMENT = 1;
const MAX_COINS = 10;
const MAX_HAND_SIZE = 4;

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
  selectedCard: Card | null;
};

type Action = {
  type:
    | "DRAW_CARD"
    | "SELECT_CARD"
    | "PLAY_CARD"
    | "DISCARD_CARD"
    | "SHUFFLE_DECK"
    | "ADD_CARDS"
    | "ADD_COINS"
    | "REMOVE_COINS";
  cardID?: number; // if the action pertains to a specific card
  cards?: Card[];
  callback?: () => void;
};

const initialState: CrownState = {
  coins: 0,
  totalCards: 0,
  deck: [],
  hand: [],
  discard: [],
  selectedCard: null,
};

/** Utility Functions */
const shuffleCards = (cards: Card[]): Card[] => {
  return [...cards].sort(() => Math.random() - 0.5);
};

const discardCardFromHand = (
  state: CrownState,
  cardID: number,
): CrownState | null => {
  const discardedCard = state.hand.find((card) => card.id === cardID);
  if (!discardedCard) return null;
  const newHand = state.hand.filter((card) => card.id !== cardID);
  return {
    ...state,
    selectedCard:
      state.selectedCard === discardedCard ? null : state.selectedCard,
    hand: newHand,
    discard: [...state.discard, discardedCard],
  };
};

const drawCardFromDeck = (state: CrownState): CrownState => {
  if (state.hand.length >= MAX_HAND_SIZE) return state;

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

const discardAndDrawCard = (state: CrownState, cardID: number): CrownState => {
  const stateAfterDiscard = discardCardFromHand(state, cardID);

  if (!stateAfterDiscard) return state;

  return drawCardFromDeck(stateAfterDiscard);
};

const updateState = (state: CrownState, action: Action): CrownState => {
  switch (action.type) {
    case "DRAW_CARD":
      return drawCardFromDeck(state);

    case "DISCARD_CARD":
      return discardAndDrawCard(state, action.cardID!);

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
        coins: Math.min(MAX_COINS, state.coins + COIN_INCREMENT),
      };

    case "SELECT_CARD":
      const card = state.hand.find((card) => card.id === action.cardID) || null;
      return { ...state, selectedCard: card };

    case "PLAY_CARD":
      if (!state.selectedCard || state.selectedCard.cost > state.coins)
        return state;

      const stateAfterDiscard = discardAndDrawCard(
        state,
        state.selectedCard.id!,
      );

      action.callback?.();
      return {
        ...stateAfterDiscard,
        coins: state.coins - state.selectedCard.cost,
      };

    default:
      return state;
  }
};

// CLASS

export class CrownStateStore {
  // Private — callers use state$ observable or the action methods
  private state$: BehaviorSubject<CrownState>;
  private coinSubscription: ReturnType<
    typeof interval.prototype.subscribe
  > | null = null;

  // Public observable — callers subscribe to this for UI updates
  readonly hand$: Observable<Card[]>;
  readonly discard$: Observable<Card[]>;
  readonly coins$: Observable<number>;
  readonly selectedCard$: Observable<Card | null>;

  constructor() {
    this.state$ = new BehaviorSubject<CrownState>(initialState);

    // Expose slices rather than raw state so callers can't mutate
    this.hand$ = this.state$.pipe(map((s) => s.hand));
    this.discard$ = this.state$.pipe(map((s) => s.discard));
    this.coins$ = this.state$.pipe(map((s) => s.coins));
    this.selectedCard$ = this.state$.pipe(map((s) => s.selectedCard));
  }

  // --- Lifecycle ---

  /** Call once to start the coin ticker */
  start() {
    this.coinSubscription = interval(1000)
      .pipe(
        startWith(0),
        map(() => ({ type: "ADD_COINS" }) as Action),
        tap((action) => this.dispatch(action)),
      )
      .subscribe();
    return this;
  }

  /** Clean up subscriptions when the room/scene is destroyed */
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

  discardCard(cardID: number) {
    this.dispatch({ type: "DISCARD_CARD", cardID });
  }

  selectCard(cardID: number) {
    this.dispatch({ type: "SELECT_CARD", cardID });
  }

  shuffleDeck() {
    this.dispatch({ type: "SHUFFLE_DECK" });
  }

  playCard(callback?: () => void) {
    this.dispatch({ type: "PLAY_CARD", callback });
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
