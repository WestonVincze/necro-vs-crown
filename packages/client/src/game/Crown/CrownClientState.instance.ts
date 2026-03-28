import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import type { Card } from "@necro-crown/shared";

type ClientCardState = {
  hand: Card[];
  discard: Card[];
  coins: number;
  selectedCard: Card | null;
};

const initialState: ClientCardState = {
  hand: [],
  discard: [],
  coins: 0,
  selectedCard: null,
};

class CrownClientState {
  private state$ = new BehaviorSubject<ClientCardState>(initialState);

  readonly hand$ = this.state$.pipe(map((s) => s.hand));
  readonly discard$ = this.state$.pipe(map((s) => s.discard));
  readonly coins$ = this.state$.pipe(map((s) => s.coins));
  readonly selectedCard$ = this.state$.pipe(map((s) => s.selectedCard));

  applyHandUpdate(hand: Card[]) {
    this.patch({ hand });
  }
  applyDiscardUpdate(discard: Card[]) {
    this.patch({ discard });
  }
  applyCoinsUpdate(coins: number) {
    this.patch({ coins });
  }

  selectCard(cardID: number) {
    const card = this.state$.value.hand.find((c) => c.id === cardID) ?? null;
    this.patch({ selectedCard: card });
  }

  getSelectedCard() {
    return this.state$.value.selectedCard;
  }

  private patch(partial: Partial<ClientCardState>) {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}

export const crownClientState = new CrownClientState();
