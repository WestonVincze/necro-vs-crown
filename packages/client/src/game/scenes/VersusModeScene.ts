import { Scene } from "phaser";
import { Room } from "@colyseus/sdk";
import {
  Faction,
  GameEvents,
  MAP_X_MAX,
  MAP_X_MIN,
  MAP_Y_MAX,
  MAP_Y_MIN,
  Networked,
  createHealthSystem,
  networkSyncComponents,
  type HitSplatEvent,
  type Pipeline,
  pipeline,
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
  initializeCrownMouseControls,
  createDrawCollisionSystem,
  createDrawSpellEffectSystem,
  createSpriteSystem,
  initializeNecroMouseControls,
  createHitSplatSystem,
  createHealthBarSystem,
} from "$game/systems";
import { createInputState, type InputState } from "../../input/InputState";
import type { Observable } from "rxjs";
import { crownClientState } from "$game/Crown";
import { isPaused, pendingUpgrade } from "../../stores/GameEventStore";

export class VersusModeScene extends Scene {
  constructor() {
    super("VersusModeScene");
  }

  playerEntities: { [sessionId: string]: any } = {};
  private playerType!: Faction;
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private world!: World;
  private snapshotDeserialize!: (
    packet: ArrayBuffer,
    idMapOverride?: Map<number, number>,
  ) => Map<number, number>;
  private soaDeserialize: any;
  private observerDeserialize: any;
  private idMap = new Map<number, number>();

  private physicsSystems!: Pipeline;

  private inputs$!: Observable<InputState>;

  init(data: { player: Faction }) {
    this.camera = this.cameras.main;
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
      createSpriteSystem(this.world, this, this.playerType),
      createDrawSpellEffectSystem(this.world, this),
      createHealthSystem(),
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

    this.camera.setBounds(MAP_X_MIN, MAP_Y_MIN, MAP_X_MAX, MAP_Y_MAX);

    const tilemap = this.make.tilemap({ key: "map" });
    tilemap.addTilesetImage("sample", "sample");
    tilemap.createLayer("Ground", "sample", MAP_X_MIN, MAP_Y_MIN);
    tilemap.createLayer("Roads", "sample", MAP_X_MIN, MAP_Y_MIN);
    tilemap.createLayer("Objects", "sample", MAP_X_MIN, MAP_Y_MIN);

    let gridData = [];
    for (let y = 0; y < tilemap.height; y++) {
      let row = [];
      for (let x = 0; x < tilemap.width; x++) {
        row.push(tilemap.hasTileAt(x, y, "Objects") ? 1 : 0);
      }
      gridData.push(row);
    }

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
      this.world.paused = true;
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
    initializeCrownMouseControls(this, (id, x, y) =>
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
    if (!this.room || this.world.paused) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedUpdate(time, this.fixedTimeStep);
    }
  }
}
