import { GameObjects, Scene } from "phaser";
import { Room } from "@colyseus/sdk";
import {
  Faction,
  GameEvents,
  Networked,
  createHealthSystem,
  networkSyncComponents,
  type HitSplatEvent,
  type Pipeline,
  pipeline,
  type GameOverEvent,
} from "@necro-crown/shared";
import { createWorld } from "bitecs";
import {
  createObserverDeserializer,
  createSnapshotDeserializer,
  createSoADeserializer,
} from "bitecs/serialization";
import { Grid } from "pathfinding";
import { type World } from "@necro-crown/shared";
import {
  createDrawCollisionSystem,
  createDrawSpellEffectSystem,
  createSpriteSystem,
  createHitSplatSystem,
  createHealthBarSystem,
} from "$game/systems";
import { createInputState, type InputState } from "../../input/InputState";
import type { Observable } from "rxjs";
import { crownClientState } from "$game/Crown";
import {
  gameOver,
  isPaused,
  pendingUpgrade,
} from "../../stores/GameEventStore";
import { buildTileMap } from "../../helpers/TileMap";
import { initializeNecroMouseControls } from "../../input/NecroMouseControls";
import { initializeCrownControls } from "../../input/CrownControls";

export class VersusModeScene extends Scene {
  constructor() {
    super("VersusModeScene");
  }

  playerEntities: { [sessionId: string]: any } = {};
  private playerType!: Faction;
  private world!: World;
  private snapshotDeserialize!: (
    packet: ArrayBuffer,
    idMapOverride?: Map<number, number>,
  ) => Map<number, number>;
  private soaDeserialize: any;
  private observerDeserialize: any;
  private idMap = new Map<number, number>();
  private spriteMap = new Map<number, GameObjects.Sprite | GameObjects.Rope>();

  private physicsSystems!: Pipeline;

  private inputs$!: Observable<InputState>;

  init(data: { player: Faction }) {
    this.inputs$ = createInputState();
  }

  room!: Room;

  units: any[] = [];

  create() {
    this.room = this.registry.get("room");
    this.playerType = this.registry.get("faction") as Faction;
    console.log("joining room...");
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.gameEvents = new GameEvents();
    this.world.unitUpgrades = {};
    this.world.experience = 0;
    this.world.paused = false;

    // initialize systems
    this.physicsSystems = pipeline([
      createDrawCollisionSystem(this.world, this),
      createDrawSpellEffectSystem(this.world, this),
      createHealthSystem(),
      createSpriteSystem(this.world, this, this.spriteMap, this.playerType),
      createHealthBarSystem(this.world, this),
    ]);

    // reactive systems initialize once
    createHitSplatSystem(this.world, this);

    // initialize deSerializers
    this.snapshotDeserialize = createSnapshotDeserializer(
      this.world,
      networkSyncComponents,
    );
    this.observerDeserialize = createObserverDeserializer(
      this.world,
      Networked,
      networkSyncComponents,
    );
    this.soaDeserialize = createSoADeserializer(networkSyncComponents);

    const { gridData } = buildTileMap(this);

    this.world.grid = new Grid(gridData);

    // initial state sync
    this.room.onMessage("snapshot", (data: ArrayBuffer) => {
      const view = new Uint8Array(data);
      this.snapshotDeserialize(view.buffer, this.idMap);
    });

    // updates to component data
    this.room.onMessage("soaUpdates", (data: ArrayBuffer) => {
      const view = new Uint8Array(data);
      this.soaDeserialize(view.buffer, this.idMap);
    });

    // updates to structure (entity/component additions and removals)
    this.room.onMessage("observerUpdates", (data: ArrayBuffer) => {
      const view = new Uint8Array(data);
      this.observerDeserialize(view.buffer, this.idMap);
    });

    this.room.onMessage("upgrade:start", (upgradeData) => {
      // this.world.paused = true;
      isPaused.set(true);
      const options =
        this.playerType === Faction.Necro
          ? upgradeData.necroOptions
          : upgradeData.crownOptions;
      // id, label, description

      pendingUpgrade.set({
        options,
        duration: upgradeData.duration,
        onSelect: (optionId) => {
          this.room.send("upgrade:selected", { optionId });
          pendingUpgrade.set(null);
        },
      });
    });

    this.room.onMessage("upgrade:complete", () => {
      this.world.paused = false;
      isPaused.set(false);
      pendingUpgrade.set(null);
    });

    this.room.onMessage("hitsplat", (e: HitSplatEvent) => {
      this.world.gameEvents.hitSplat$.next(e);
    });

    this.room.onMessage("gameOver", (e: GameOverEvent) => {
      gameOver.set(e);
    });

    if (this.playerType === Faction.Crown) {
      this.initializeCrown();
    } else if (this.playerType === Faction.Necro) {
      this.initializeNecro();
    }

    this.room.send("loaded");
  }

  initializeNecro() {
    initializeNecroMouseControls(this, (x, y) => {
      this.room?.send("set_cursor_waypoint", { x, y });
    });
    this.inputs$.subscribe((inputs) => this.room?.send("key_inputs", inputs));
  }

  initializeCrown() {
    initializeCrownControls(this, (id, x, y) =>
      this.room?.send("play_card", {
        id,
        xPos: x,
        yPos: y,
      }),
    );
    this.room.onMessage("hand:update", ({ hand }) => {
      console.log("update hand");
      crownClientState.applyHandUpdate(hand);
    });
    this.room.onMessage("discard:update", ({ discard }) =>
      crownClientState.applyDiscardUpdate(discard),
    );
    this.room.onMessage("coins:update", ({ coins }) =>
      crownClientState.applyCoinsUpdate(coins),
    );
  }

  fixedUpdate(time: number, delta: number) {
    if (!this.room) return;
    this.physicsSystems(this.world);
  }

  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;

  update(time: number, delta: number): void {
    if (!this.room /*|| this.world.paused*/) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedUpdate(time, this.fixedTimeStep);
    }
  }
}
