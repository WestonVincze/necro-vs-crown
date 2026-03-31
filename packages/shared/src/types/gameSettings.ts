import { Faction, Stats, UnitName } from "./units";

// Lobby
export type PlayerConfig = {
  faction: Faction;
  ready: boolean;
};

export type StatOverrides = Partial<Record<UnitName, Stats>>;
export type CrownConfig = {
  coinInterval: number;
  maxHandSize: number;
  maxCoins: number;
};

export type GameSettings = {
  statOverrides: StatOverrides;
  crownConfig: CrownConfig;
  startingCards: Partial<Record<UnitName, number>>;
  skeleMansCount: number;
};
