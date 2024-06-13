import { writable } from "svelte/store";
import { type CrownState } from "$game/Crown";

// TODO: migrate "Cards.ts" to a store for ease of access
const initialState: CrownState = {
  coins: 0,
  totalCards: 0,
  deck: [],
  hand: [],
  discard: [],
  selectedCard: null,
};

export const CrownStateStore = writable(initialState);
