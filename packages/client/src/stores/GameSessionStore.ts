import { writable } from "svelte/store";
import type { Room } from "@colyseus/sdk";
import type { Faction } from "@necro-crown/shared";
import { Game } from "phaser";

type GameSession = {
  room: Room;
  faction: Faction;
};

export const pendingGameSession = writable<GameSession | null>(null);

export const gameReference = writable<Game | null>(null);
