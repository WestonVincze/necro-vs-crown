import {
  DEFAULT_CROWN_CONFIG,
  DEFAULT_STARTING_HAND,
  GameSettings,
  PlayerConfig,
  Stats,
  UnitName,
  type Faction,
} from "@necro-crown/shared";
import { Room, Client, matchMaker } from "colyseus";

type LobbyState = {
  players: Map<string, PlayerConfig>;
} & GameSettings;

export class GameLobby extends Room {
  private lobbyState: LobbyState = {
    players: new Map(),
    statOverrides: {},
    crownConfig: { ...DEFAULT_CROWN_CONFIG },
    startingCards: { ...DEFAULT_STARTING_HAND },
    skeleMansCount: 7,
  };

  onCreate() {
    this.maxClients = 2;

    this.onMessage(
      "selectFaction",
      (client, { faction }: { faction: Faction }) => {
        const player = this.lobbyState.players.get(client.sessionId);
        if (!player) return;

        // Ensure factions are unique
        const factionTaken = [...this.lobbyState.players.values()].some(
          (p) => p.faction === faction,
        );

        if (factionTaken) {
          client.send("error", { message: "Faction already taken" });
          return;
        }

        player.faction = faction;
        this.broadcast("lobby:updated", this.getPublicState());
      },
    );

    this.onMessage(
      "updateCrownConfig",
      (client, config: Partial<LobbyState["crownConfig"]>) => {
        this.lobbyState.crownConfig = {
          ...this.lobbyState.crownConfig,
          ...config,
        };
        this.broadcast("lobby:updated", this.getPublicState());
      },
    );

    this.onMessage(
      "updateUnitStatOverrides",
      (client, overrides: { unitName: UnitName; stats: Partial<Stats> }) => {
        if (Object.keys(overrides.stats).length === 0) {
          delete this.lobbyState.statOverrides[overrides.unitName];
        } else {
          this.lobbyState.statOverrides = {
            ...this.lobbyState.statOverrides,
            [overrides.unitName]: overrides.stats,
          };
        }
        this.broadcast("lobby:updated", this.getPublicState());
      },
    );

    this.onMessage("resetAllOverrides", (client) => {
      this.lobbyState.statOverrides = {};
      this.broadcast("lobby:updated", this.getPublicState());
    });

    this.onMessage(
      "updateStartingCard",
      (client, card: { unitName: UnitName; value: number }) => {
        const current = this.lobbyState.startingCards[card.unitName] || 0;
        this.lobbyState.startingCards = {
          ...this.lobbyState.startingCards,
          [UnitName[card.unitName]]: current + card.value,
        };
        this.broadcast("lobby:updated", this.getPublicState());
      },
    );

    this.onMessage("updateSkeleMansCount", (client, value) => {
      this.lobbyState.skeleMansCount = value;
      this.broadcast("lobby:updated", this.getPublicState());
    });

    this.onMessage("ready", (client) => {
      const player = this.lobbyState.players.get(client.sessionId);
      if (!player) return;
      player.ready = true;

      this.broadcast("lobby:updated", this.getPublicState());
      this.checkAllReady();
    });

    this.onMessage("unready", (client) => {
      const player = this.lobbyState.players.get(client.sessionId);
      if (!player) return;
      player.ready = false;

      this.broadcast("lobby:updated", this.getPublicState());
    });
  }

  onJoin(client: Client) {
    console.log(client.sessionId, "joined!");
    this.lobbyState.players.set(client.sessionId, {
      faction: null,
      ready: false,
    });
    this.broadcast("lobby:updated", this.getPublicState());
  }

  onLeave(client: Client) {
    this.lobbyState.players.delete(client.sessionId);
    this.broadcast("lobby:updated", this.getPublicState());
  }

  private checkAllReady() {
    const players = [...this.lobbyState.players.values()];
    const allReady =
      players.length === 2 && players.every((p) => p.ready && p.faction);
    if (!allReady) return;

    this.createGameRoom();
  }

  private async createGameRoom() {
    const players: Record<string, Faction> = {};

    this.lobbyState.players.forEach((config, sessionId) => {
      players[sessionId] = config.faction;
    });

    const gameRoom = await matchMaker.createRoom("my_room", {
      players,
      crownConfig: this.lobbyState.crownConfig,
      statOverrides: this.lobbyState.statOverrides,
      startingCards: this.lobbyState.startingCards,
      skeleMansCount: this.lobbyState.skeleMansCount,
    });

    // Send each client a reservation
    for (const client of this.clients) {
      const reservation = await matchMaker.reserveSeatFor(gameRoom, {
        lobbySessionId: client.sessionId,
      });

      client.send("game:starting", { reservation });
    }

    // Lock and dispose the lobby
    await this.lock();
    await this.disconnect();
  }

  private getPublicState() {
    return {
      players: Object.fromEntries(this.lobbyState.players),
      crownConfig: this.lobbyState.crownConfig,
      statOverrides: this.lobbyState.statOverrides,
      startingCards: this.lobbyState.startingCards,
      skeleMansCount: this.lobbyState.skeleMansCount,
    };
  }
}
