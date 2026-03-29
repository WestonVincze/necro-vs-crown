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
  Level,
  Player,
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
  createTimeSystem,
  GameEvents,
  HitSplatEvent,
  Input,
  BASE_EXP,
  createSpellEffectSystem,
  createBonesEntity,
  Cursor,
  getGridCellFromPosition,
  Position,
  GridCell,
  Behavior,
  Behaviors,
  CrownStateStore,
  Card,
} from "@necro-crown/shared";
import { createDeathSystem } from "../systems/deathSystem";
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
      createTimeSystem(), // time should always be last
    ]);

    this.tickSystems = pipeline([
      createTargetingSystem(),
      createAssignFollowTargetSystem(),
    ]);

    this.world.gameEvents.hitSplat$.subscribe((e: HitSplatEvent) => {
      this.broadcast("hitsplat", e);
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
        console.log(this.necroPlayer.sessionId);
        player.eid = createUnitEntity(
          this.world,
          UnitName.Necromancer,
          500,
          500,
        );
        createBonesEntity(this.world, 400, 400);

        const cursorEid = addEntity(this.world);
        addComponent(this.world, cursorEid, Cursor);
        addComponent(this.world, cursorEid, Position);
        addComponent(this.world, cursorEid, GridCell);

        // create some skele mans
        for (let i = 0; i < 7; i++) {
          const skele = createUnitEntity(
            this.world,
            UnitName.Skeleton,
            Math.random() * 1024,
            Math.random() * 1024,
          );
          Behavior.type[skele] = Behaviors.FollowCursor;
        }
      } else if (player.faction === Faction.Crown) {
        this.crownPlayer = client;
        const eid = addEntity(this.world);
        player.eid = eid;
        addComponent(this.world, eid, Player);
        addComponent(this.world, eid, Level);
        Level.currentLevel[eid] = 0;
        Level.currentExp[eid] = 0;
        Level.expToNextLevel[eid] = BASE_EXP;

        // initialize crown state
        const cards: Card[] = [];
        for (let i = 0; i < 8; i++) {
          cards.push({
            id: i,
            name: UnitName.Peasant,
            cost: 3,
          });
        }
        if (options.crownConfig) {
          this.crownState.updateConfig(options.crownConfig);
        }
        this.crownState.addCards(cards);
        this.crownState.drawCard();
        this.crownState.drawCard();
        this.crownState.drawCard();
        this.crownState.drawCard();
        this.crownState.start();

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
      // create new observer serializer for this client
      this.observerSerializers.set(
        client.sessionId,
        createObserverSerializer(this.world, Networked, networkSyncComponents),
      );

      const allLoaded = [...this.players.values()].every(
        (p) => p.status === "ready",
      );
      if (!allLoaded) return;

      // initial state sync
      const snapshot = this.snapshotSerializer();
      for (const c of this.clients) {
        c.send("snapshot", snapshot);
      }

      // start game loop
      let elapsedTime = 0;
      let timeSinceLastTick = 0;
      this.setSimulationInterval(async (deltaTime) => {
        if (this.world.paused) return;
        if (this.world.experience > 20) {
          this.world.experience -= 10;
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

        while (elapsedTime >= this.fixedTimeStep) {
          elapsedTime -= this.fixedTimeStep;
          this.fixedUpdate(this.fixedTimeStep);
        }
        while (timeSinceLastTick >= this.tickTimeStep) {
          timeSinceLastTick -= this.tickTimeStep;
          this.tickSystems(this.world);
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
  }
}
