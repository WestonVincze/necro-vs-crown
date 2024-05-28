import { BehaviorSubject, Observable, map, of, scan } from "rxjs";

  /** generates random cards for testing purposes */
  const generateMockCards = (count: number) => {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.random();

      cards.push({
        id: i,
        UnitID: roll > 0.5 ? "guard" : "peasant",
        cost: roll > 0.5 ? 5 : 3,
      })
    }
    return cards;
  }

  type Card = {
    id?: number,
    UnitID: string,
    cost: number,
  }

  type State = {
    totalCards: number,
    deck: Card[],
    hand: Card[],
    discard: Card[],
  }

  type Action = {
    type: "DRAW_CARD" | "DISCARD_CARD" | "SHUFFLE_DECK" | "ADD_CARDS",
    cardID?: number // if the action pertains to a specific card
    cards?: Card[]
  }

  const initialState: State = {
    totalCards: 0,
    deck: [],
    hand: [],
    discard: [],
  };

  const updateState = (state: State, action: Action): State => {
    switch (action.type) {
      case "DRAW_CARD":
        if (state.deck.length === 0) {
          if (state.discard.length === 0) return state;

          const [drawnCard, ...newDeck] = shuffleCards(state.discard);
          return { ...state, deck: newDeck, hand: [...state.hand, drawnCard], discard: [], };
        }
        const [drawnCard, ...newDeck] = state.deck;
        return { ...state, deck: newDeck, hand: [...state.hand, drawnCard] }

      case "DISCARD_CARD":
        const discardedCard = state.hand.find(card => card.id === action.cardID);
        if (!discardedCard) return state;

        const newHand = state.hand.filter(card => card.id !== action.cardID);

        return { ...state, hand: newHand, discard: [ ...state.discard, discardedCard] }

      case "SHUFFLE_DECK":
        const shuffledDeck = shuffleCards(state.deck);
        return { ...state, deck: shuffledDeck }

      case "ADD_CARDS":
        if (!action.cards) return state;

        const newCardsWithID = action.cards.map((card, i) => ({ ...card, id: state.totalCards + i + 1 }))
        const totalCards = state.totalCards + action.cards?.length;
        return { ...state, totalCards, deck: [...state.deck, ...newCardsWithID] };

      default:
        return state;
    }
  }

  const gameState$ = new BehaviorSubject<State>(initialState);

  const mockFetchCards = (): Observable<Card[]> => {
    return of(generateMockCards(8))
  }

  mockFetchCards().pipe(
    map(cards => ({ type: "ADD_CARDS", cards } as Action)),
    scan((state, action) => updateState(state, action), initialState),
  ).subscribe(state => gameState$.next(state));

  const shuffleCards = (cards: Card[]): Card[] => {
    return cards.sort(() => Math.random() - 0.5);
  }

  const dispatchAction = (action: Action) => {
    gameState$.next(updateState(gameState$.value, action));
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
    dispatchAction({ type: "DRAW_CARD" })
  }

  const addNewCards = (cards: Card[]) => {
    dispatchAction({ type: "ADD_CARDS", cards });
  };

  export { gameState$, drawCard, discardCard, addNewCards }
