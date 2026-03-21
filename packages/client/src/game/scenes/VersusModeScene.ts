import { Scene } from "phaser";
import { Client, Room } from "@colyseus/sdk";
import {
  Faction,
  GameEvents,
  MAP_X_MAX,
  MAP_X_MIN,
  MAP_Y_MAX,
  MAP_Y_MIN,
  Networked,
  createDrawCollisionSystem,
  createDrawSpellEffectSystem,
  createHealthBarSystem,
  createHealthSystem,
  createHitSplatSystem,
  createSpriteSystem,
  initializeNecroMouseControls,
  networkSyncComponents,
  type HitSplatEvent,
  type Pipeline,
} from "@necro-crown/shared";
import { createWorld } from "bitecs";
import {
  createObserverDeserializer,
  createSnapshotDeserializer,
  createSoADeserializer,
} from "bitecs/serialization";
import { Grid } from "pathfinding";
import { type World, pipeline } from "@necro-crown/shared";
import { initializeCrownMouseControls } from "$game/systems";
import { createInputState, type InputState } from "../../input/InputState";
import type { Observable } from "rxjs";

export class VersusModeScene extends Scene {
  constructor() {
    super("VersusModeScene");
  }

  playerEntities: { [sessionId: string]: any } = {};
  private playerType!: Faction;
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private world!: World;
  private snapshotDeserialize: any;
  private soaDeserialize: any;
  private observerDeserialize: any;
  private idMap = new Map<number, number>();

  // system references
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  private inputs$!: Observable<InputState>;

  init(data: { player: Faction }) {
    this.playerType = data.player;
    this.camera = this.cameras.main;
    this.inputs$ = createInputState();
  }

  client = new Client("ws://localhost:2567");
  room?: Room;

  units: any[] = [];

  async create() {
    console.log("joining room...");
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.gameEvents = new GameEvents();

    // initialize systems
    this.physicsSystems = pipeline([
      createDrawCollisionSystem(this.world, this),
      createSpriteSystem(this.world, this),
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

    try {
      this.room = await this.client.joinOrCreate("my_room", {
        playerType: this.playerType,
      });
      console.log("Joined Successfully!");
    } catch (e) {
      console.error(e);
    }

    if (!this.room) return;

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

    this.room.onMessage("hitsplat", (e: HitSplatEvent) => {
      this.world.gameEvents.hitSplat$.next(e);
    });

    if (this.playerType === Faction.Crown) {
      initializeCrownMouseControls(this, (name, x, y) =>
        this.room?.send("add_crown_unit", {
          name: name,
          xPos: x,
          yPos: y,
        }),
      );
    } else if (this.playerType === Faction.Necro) {
      initializeNecroMouseControls(this.world, this);
      this.inputs$.subscribe((inputs) => this.room?.send("key_inputs", inputs));
    }
  }

  fixedUpdate(time: number, delta: number) {
    if (!this.room) return;
    this.physicsSystems(this.world);
  }

  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;

  update(time: number, delta: number): void {
    if (!this.room) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedUpdate(time, this.fixedTimeStep);
    }
  }
}
