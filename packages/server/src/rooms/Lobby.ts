import { Faction } from "@necro-crown/shared";
import { Room, Client, matchMaker } from "colyseus";

type PlayerConfig = {
  faction: Faction;
  ready: boolean;
};

type LobbyState = {
  players: Map<string, PlayerConfig>;
  gameConfig: {
    maxCoins: number;
    maxHandSize: number;
    coinInterval: number;
  };
};

export class GameLobby extends Room {
  private lobbyState: LobbyState = {
    players: new Map(),
    gameConfig: {
      maxCoins: 10,
      maxHandSize: 7,
      coinInterval: 1000,
    },
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
      "updateConfig",
      (client, config: Partial<LobbyState["gameConfig"]>) => {
        this.lobbyState.gameConfig = {
          ...this.lobbyState.gameConfig,
          ...config,
        };
        this.broadcast("lobby:updated", this.getPublicState());
      },
    );

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
      gameConfig: this.lobbyState.gameConfig,
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
      gameConfig: this.lobbyState.gameConfig,
    };
  }
}
