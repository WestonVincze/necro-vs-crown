import { Room, Client, CloseCode } from "colyseus";
import {
  addComponent,
  addEntity,
  createWorld,
  getEntityComponents,
  query,
  removeEntity,
} from "bitecs";
import {
  createObserverSerializer,
  createSnapshotSerializer,
  createSoASerializer,
} from "bitecs/serialization";
import { Grid } from "pathfinding";
import { staticGridData } from "../staticGridData";
import {
  Faction,
  Pipeline,
  UnitName,
  type World,
  createUnitEntity,
  Networked,
  networkSyncComponents,
  pipeline,
  createSeparationForceSystem,
  createMovementSystem,
  createFollowTargetSystemNew,
  createGridSystemNew,
  createAssignFollowTargetSystem,
  createTargetingSystem,
  createCooldownSystem,
  createCombatSystem,
  createProjectileCollisionSystem,
  createSpellcastingSystem,
  createHealthSystem,
  createDestroyAfterDelaySystem,
  GameEvents,
  HitSplatEvent,
  Input,
  createSpellEffectSystem,
  createArcherTower,
  Cursor,
  getGridCellFromPosition,
  Position,
  GridCell,
  CrownStateStore,
  Card,
  CardData,
  GameOverEvent,
  createBonesEntity,
  createPeasantHut,
} from "@necro-crown/shared";
import { createDeathSystem } from "../systems/DeathSystem";
import { GameSettings } from "@necro-crown/shared/src/types";
import { UpgradeManager } from "../managers/UpgradeManager";
interface PlayerRecord {
  eid: number;
  faction: Faction;
  status: "loading" | "ready" | "disconnected";
}

type RoomSettings = {
  players: Record<string, Faction>;
} & GameSettings;

export class MyRoom extends Room {
  private world!: World;

  // serializers
  private soaSerialize: (
    selectedEntities: readonly number[] | number[],
  ) => ArrayBuffer;
  private observerSerializers: Map<string, () => ArrayBuffer> = new Map();
  private snapshotSerializer: (
    selectedEntities?: readonly number[] | number[],
  ) => ArrayBuffer;

  // player data
  private players: Map<string, PlayerRecord> = new Map();
  private crownPlayer: Client;
  private necroPlayer: Client;
  private lobbyIdToFaction: Record<string, Faction>;
  private startingHand: Partial<Record<UnitName, number>>;
  private skeleMansCount: number;

  // systems
  private systems!: Pipeline;
  private tickSystems!: Pipeline;

  private upgradeManager = new UpgradeManager();

  // card state
  private crownState = new CrownStateStore();

  maxClients = 2;
  fixedTimeStep = 1000 / 60;
  tickTimeStep = 200;

  onCreate(options: RoomSettings) {
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.grid = new Grid(staticGridData);
    this.world.gameEvents = new GameEvents();
    this.world.networkType = "networked";
    this.world.unitUpgrades = options.statOverrides || {};
    this.world.experience = 0;
    this.world.paused = false;

    this.lobbyIdToFaction = options.players;
    this.startingHand = options.startingCards;
    this.skeleMansCount = options.skeleMansCount;

    this.soaSerialize = createSoASerializer(networkSyncComponents);
    this.snapshotSerializer = createSnapshotSerializer(
      this.world,
      networkSyncComponents,
    );

    this.systems = pipeline([
      createGridSystemNew(this.world),
      createFollowTargetSystemNew(this.world),
      createSeparationForceSystem(),
      createMovementSystem(),
      createCooldownSystem(),
      createCombatSystem(),
      createProjectileCollisionSystem(),
      createCooldownSystem(),
      createSpellcastingSystem(),
      createSpellEffectSystem(this.world),
      createHealthSystem(),
      createDestroyAfterDelaySystem(),
      createDeathSystem(this.world),
      // createTimeSystem(),
    ]);

    this.tickSystems = pipeline([
      createTargetingSystem(),
      createAssignFollowTargetSystem(),
    ]);

    this.world.gameEvents.hitSplat$.subscribe((e: HitSplatEvent) => {
      this.broadcast("hitsplat", e);
    });

    this.world.gameEvents.gameOver$.subscribe((e: GameOverEvent) => {
      this.pauseGame();
      this.broadcast("gameOver", e);
    });

    this.onMessage(
      "play_card",
      (
        client,
        { id, xPos, yPos }: { id: number; xPos: number; yPos: number },
      ) => {
        const { faction } = this.players.get(client.sessionId);
        if (faction !== Faction.Crown) {
          console.error(
            `Client ${client.sessionId} is not permitted to send message 'play_card'`,
          );
          return;
        }

        const success = this.crownState.playCard(id, (name: UnitName) => {
          createUnitEntity(this.world, name, xPos, yPos);
        });

        if (!success) {
          // TODO: listen for this event in client
          client.send("play_card:rejected", { cardId: id });
        }
      },
    );

    this.onMessage(
      "set_cursor_waypoint",
      (client, { x, y }: { x: number; y: number }) => {
        const { faction } = this.players.get(client.sessionId);
        if (faction !== Faction.Necro) {
          console.error(
            `Client ${client.sessionId} is not permitted to send message 'set_cursor_waypoint'`,
          );
          return;
        }
        const [cursorEid] = query(this.world, [Cursor]);
        Position.x[cursorEid] = x;
        Position.y[cursorEid] = y;
        const gridCellPosition = getGridCellFromPosition({ x, y });
        GridCell.x[cursorEid] = gridCellPosition.x;
        GridCell.y[cursorEid] = gridCellPosition.y;
      },
    );

    this.onMessage("key_inputs", (client, keys) => {
      const player = this.players.get(client.sessionId);
      if (player.faction !== Faction.Necro) {
        console.error(
          `Client ${client.sessionId} is not permitted to send message 'set_cursor_waypoint'`,
        );
        return;
      }
      Input.castingSpell[player.eid] = keys.castingSpell ? 1 : 0;
      Input.moveX[player.eid] = keys.moveX;
      Input.moveY[player.eid] = keys.moveY;
    });

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

    this.onMessage("upgrade:selected", (client, { optionId }) => {
      this.upgradeManager.recordSelection(client.sessionId, optionId);
    });

    this.onMessage("debug:snapshot-request", (client, { eid }) => {
      const snapshot = eid
        ? this.getEntitySnapshot(eid)
        : this.snapshotSerializer();
      client.send("debug:snapshot", snapshot);
    });

    this.onMessage("loaded", (client) => {
      const player = this.players.get(client.sessionId);
      if (!player) return;

      player.status = "ready";
      if (player.faction === Faction.Necro) {
        this.necroPlayer = client;
        player.eid = createUnitEntity(
          this.world,
          UnitName.Necromancer,
          0,
          1600,
        );

        const cursorEid = addEntity(this.world);
        addComponent(this.world, cursorEid, Cursor);
        addComponent(this.world, cursorEid, Position);
        addComponent(this.world, cursorEid, GridCell);

        // create some skele mans
        for (let i = 0; i < this.skeleMansCount; i++) {
          createBonesEntity(
            this.world,
            Math.random() * 400 - 200,
            Math.random() * 200 + 1600,
          );
        }
      } else if (player.faction === Faction.Crown) {
        this.crownPlayer = client;

        // represents crown player
        player.eid = createArcherTower(this.world, 75, -1550);

        // create some peasant huts (TODO: position initialization to sprite map)
        createPeasantHut(this.world, -400, 1000);
        createPeasantHut(this.world, 800, 500);
        createPeasantHut(this.world, -80, -300);
        createPeasantHut(this.world, 500, -1000);
        createPeasantHut(this.world, -900, -1100);

        // initialize crown state
        const cards: Card[] = [];
        if (options.crownConfig) {
          this.crownState.updateConfig(options.crownConfig);
        }
        Object.keys(this.startingHand).forEach((entry) => {
          const name = entry as UnitName;
          for (let i = 0; i < this.startingHand[name]; i++) {
            cards.push({
              id: cards.length,
              name,
              cost: CardData[name].cost,
            });
          }
        });
        this.crownState.addCards(cards);
        this.crownState.drawCard();
        this.crownState.drawCard();
        this.crownState.drawCard();
        this.crownState.drawCard();

        this.crownState.hand$.subscribe((hand) => {
          this.crownPlayer?.send("hand:update", { hand });
        });

        this.crownState.discard$.subscribe((discard) => {
          this.crownPlayer?.send("discard:update", { discard });
        });

        this.crownState.coins$.subscribe((coins) => {
          this.crownPlayer?.send("coins:update", { coins });
        });
      }

      const allLoaded = [...this.players.values()].every(
        (p) => p.status === "ready",
      );
      if (!allLoaded) return;

      // initial state sync
      const snapshot = this.snapshotSerializer();
      for (const c of this.clients) {
        c.send("snapshot", snapshot);
      }

      // create new observers serializer for clients
      this.observerSerializers.set(
        this.necroPlayer.sessionId,
        createObserverSerializer(this.world, Networked, networkSyncComponents),
      );
      this.observerSerializers.set(
        this.crownPlayer.sessionId,
        createObserverSerializer(this.world, Networked, networkSyncComponents),
      );

      // start game loop
      let elapsedTime = 0;
      let timeSinceLastTick = 0;
      this.pauseGame();
      setTimeout(() => {
        console.log("starting game");
        this.crownState.start();
        this.world.paused = false;
      }, 2000);
      this.setSimulationInterval((deltaTime) => {
        if (!this.world.paused) {
          const expToUpgrade = this.upgradeManager.getExpToNextUpgrade();
          if (this.world.experience > expToUpgrade) {
            this.world.experience -= expToUpgrade;
            this.upgradeManager.startUpgradeRound(
              this.world,
              this,
              () => this.pauseGame(),
              () => this.resumeGame(),
              (card: Card) => this.crownState.addCards([card]),
            );
          }
          elapsedTime += deltaTime;
          timeSinceLastTick += deltaTime;

          while (timeSinceLastTick >= this.tickTimeStep) {
            timeSinceLastTick -= this.tickTimeStep;
            this.tickSystems(this.world);
          }
          while (elapsedTime >= this.fixedTimeStep) {
            elapsedTime -= this.fixedTimeStep;
            this.world.time.delta = elapsedTime;
            this.fixedUpdate(this.fixedTimeStep);
          }
        }

        // get updates to component values
        const soaUpdates = this.soaSerialize(
          query(this.world, [Networked]) as readonly number[],
        );
        this.broadcast("soaUpdates", soaUpdates);

        // get updates for add/remove entities & components for the client
        for (const [sessionId, serializer] of this.observerSerializers) {
          const updates = serializer();
          if (updates.byteLength > 0) {
            const client = this.clients.getById(sessionId);
            if (client) {
              client.send("observerUpdates", updates);
            }
          }
        }
      });
    });
  }

  pauseGame() {
    this.world.paused = true;
    this.crownState.pause();
  }

  resumeGame() {
    this.world.paused = false;
    this.crownState.resume();
  }

  getEntitySnapshot(eid: number) {
    return {
      eid,
      components: getEntityComponents(this.world, eid),
      timestamp: Date.now(),
    };
  }

  onJoin(client: Client, options: { lobbySessionId: string }) {
    const faction = this.lobbyIdToFaction[options.lobbySessionId];

    this.players.set(client.sessionId, {
      eid: 0,
      status: "loading",
      faction,
    });

    client.send("session:init", { faction });
  }

  onLeave(client: Client, code: CloseCode) {
    console.log(client.sessionId, "left!");

    const player = this.players.get(client.sessionId);
    if (player) {
      removeEntity(this.world, player.eid);
      this.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.crownState.destroy();
  }

  fixedUpdate(deltaTime: number) {
    // run system pipeline
    this.systems(this.world);
  }
}
