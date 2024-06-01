// TODO: move to server
import { BehaviorSubject, Observable, interval, map, of, scan, startWith, tap } from "rxjs";

const COIN_INCREMENT = 1;
const MAX_COINS = 10;
const MAX_HAND_SIZE = 4;

/** generates random cards for testing purposes */
const generateMockCards = (count: number) => {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();

    cards.push({
      id: i,
      UnitID: roll > 0.5 ? "guard" : "peasant",
      cost: roll > 0.5 ? 4 : 3,
    })
  }
  return cards;
}

type Card = {
  id?: number,
  UnitID: string, // TODO: change to name
  cost: number,
}

type State = {
  coins: number,
  totalCards: number,
  deck: Card[],
  hand: Card[],
  discard: Card[],
  selectedCard: Card | null,
}

type Action = {
  type: "DRAW_CARD" | "SELECT_CARD" | "PLAY_CARD" | "DISCARD_CARD" | "SHUFFLE_DECK" | "ADD_CARDS" | "ADD_COINS" | "REMOVE_COINS" 
  cardID?: number // if the action pertains to a specific card
  cards?: Card[]
  callback?: () => void
}

const initialState: State = {
  coins: 0,
  totalCards: 0,
  deck: [],
  hand: [],
  discard: [],
  selectedCard: null,
};

/** Utility Functions */
const shuffleCards = (cards: Card[]): Card[] => {
  return cards.sort(() => Math.random() - 0.5);
}

const discardCardFromHand = (state: State, cardID: number): State | null => {
  const discardedCard = state.hand.find(card => card.id === cardID);
  if (!discardedCard) return null;
  const newHand = state.hand.filter(card => card.id !== cardID);
  return { ...state, selectedCard: state.selectedCard === discardedCard ? null : state.selectedCard, hand: newHand, discard: [...state.discard, discardedCard] };
};

const drawCardFromDeck = (state: State): State => {
  if (state.hand.length >= MAX_HAND_SIZE) return state;

  if (state.deck.length === 0) {
    if (state.discard.length === 0) return state;
    const newDeck = shuffleCards(state.discard);
    const [drawnCard, ...remainingDeck] = newDeck;
    return { ...state, deck: remainingDeck, hand: [...state.hand, drawnCard], discard: [] };
  }
  const [drawnCard, ...newDeck] = state.deck;
  return { ...state, deck: newDeck, hand: [...state.hand, drawnCard] };
};

const discardAndDrawCard = (state: State, cardID: number): State  => {
  const stateAfterDiscard = discardCardFromHand(state, cardID);

  if (!stateAfterDiscard) return state;

  return drawCardFromDeck(stateAfterDiscard);
};

const updateState = (state: State, action: Action): State => {
  switch (action.type) {
    case "DRAW_CARD":
      return drawCardFromDeck(state);

    case "DISCARD_CARD":
      return discardAndDrawCard(state, action.cardID!);

    case "SHUFFLE_DECK":
      const shuffledDeck = shuffleCards(state.deck);
      return { ...state, deck: shuffledDeck }

    case "ADD_CARDS":
      if (!action.cards) return state;

      const newCardsWithID = action.cards.map((card, i) => ({ ...card, id: state.totalCards + i + 1 }))
      const totalCards = state.totalCards + action.cards?.length;
      return { ...state, totalCards, deck: [...state.deck, ...newCardsWithID] };

    case "ADD_COINS":
      return { ...state, coins: Math.min(MAX_COINS, state.coins + COIN_INCREMENT)};

    case "SELECT_CARD":
      const card = state.hand.find(card => card.id === action.cardID) || null;
      return { ...state, selectedCard: card }

    case "PLAY_CARD":
      if (state.selectedCard === null || state.selectedCard.cost > state.coins) return state;

      const stateAfterDiscard = discardAndDrawCard(state, state.selectedCard.id!);

      action.callback?.();
      return { ...stateAfterDiscard, coins: state.coins - state.selectedCard.cost }
    
    default:
      return state;
  }
}

const crownState$ = new BehaviorSubject<State>(initialState);

const mockFetchCards = (): Observable<Card[]> => {
  return of(generateMockCards(8))
}

mockFetchCards().pipe(
  map(cards => ({ type: "ADD_CARDS", cards } as Action)),
  scan((state, action) => updateState(state, action), initialState),
).subscribe(state => crownState$.next(state));

// actions
const dispatchAction = (action: Action) => {
  crownState$.next(updateState(crownState$.value, action));
}

const shuffleDeck = () => {
  dispatchAction({ type: "SHUFFLE_DECK" })
}

const drawCard = () => {
  dispatchAction({ type: "DRAW_CARD" })
}

const discardCard = (cardID?: number) => {
  if (!cardID) return;
  dispatchAction({ type: "DISCARD_CARD", cardID })
}

const addNewCards = (cards: Card[]) => {
  dispatchAction({ type: "ADD_CARDS", cards });
};

const selectCard = (cardID?: number) => {
  if (!cardID) return;
  dispatchAction({ type: "SELECT_CARD", cardID })
}

const playCard = (callback?: () => void) => {
  dispatchAction({ type: "PLAY_CARD", callback })
}

interval(1000).pipe(
  startWith(0),
  map(() => ({ type: "ADD_COINS" } as Action)),
  tap(action => dispatchAction(action))
).subscribe();

export { crownState$, drawCard, discardCard, addNewCards, playCard, selectCard }
