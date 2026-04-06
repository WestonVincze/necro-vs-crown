import { addComponent, addEntity, createWorld } from "bitecs";
import { Scene } from "phaser";
import { Grid } from "pathfinding";
import GUI from "lil-gui";
import {
  type System,
  Player,
  createUnitEntity,
  createBonesEntity,
  Faction,
  Behavior,
  Behaviors,
  createTargetSpawnerEntity,
  UnitName,
  Level,
  CoinAccumulator,
  Coin,
  createDeathSystem,
  GameEvents,
  type Pipeline,
  BASE_EXP,
  type World,
  profiler,
  Position,
  GridCell,
  Cursor,
  getGridCellFromPosition,
  CrownStateStore,
  generateMockCards,
  Units,
} from "@necro-crown/shared";
import {
  initializeNecroMouseControls,
  initializeCrownMouseControls,
  createInputHandlerSystem,
  createHitSplatSystem,
  createGridSystem,
  createFollowTargetSystem,
} from "$game/systems";
import { GameState } from "$game/managers";
import { buildPhysicsPipeline, buildTickPipeline } from "$game/pipelines";
import { crownClientState } from "$game/Crown";
import { buildTileMap } from "../../helpers/TileMap";
import { buttons } from "../../stores/PlaygroundStore";

export class PlaygroundScene extends Scene {
  private world!: World;
  private gui: GUI;

  private initializeEntities: () => void = () => {};

  // system references
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  private timeSinceLastTick: number = 0;

  constructor() {
    super("PlaygroundScene");
    this.gui = new GUI();
  }

  init() {}

  create() {
    console.log("welcome to the playground");
    // instantiate world
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.gameEvents = new GameEvents();
    this.world.networkType = "offline";
    this.world.unitUpgrades = {};
    this.world.paused = true;
    // this.world.experience = 0; // not yet used

    // create base systems
    let physicsSystems: { pre: System[]; post: System[] } = {
      pre: [],
      post: [],
    };

    const { gridData, map } = buildTileMap(this);

    this.world.grid = new Grid(gridData);

    initializeCrownMouseControls(this, () => {});

    // set up create entity buttons
    const unitToSpawn: { name: UnitName; x: number; y: number } = {
      name: UnitName.Skeleton,
      x: 0,
      y: 0,
    };

    const buttons = {
      spawnUnit: () =>
        createUnitEntity(
          this.world,
          unitToSpawn.name,
          unitToSpawn.x,
          unitToSpawn.y,
        ),
      togglePause: () => (this.world.paused = !this.world.paused),
      tickUpdate: () => this.tickSystems(this.world),
      frameUpdate: () => this.physicsSystems(this.world),
    };

    this.gui.add(this.world, "paused");
    this.gui.add(buttons, "tickUpdate");
    this.gui.add(buttons, "frameUpdate");

    const unitFolder = this.gui.addFolder("Unit Spawn");
    unitFolder.add(unitToSpawn, "name", Object.keys(Units));
    unitFolder.add(unitToSpawn, "x");
    unitFolder.add(unitToSpawn, "y");
    unitFolder.add(buttons, "spawnUnit");

    this.events.on("destroy", () => {
      console.log("destroy scene");
      this.gui.destroy();
    });

    physicsSystems.pre = [
      createInputHandlerSystem(),
      createGridSystem(this.world, map),
      createFollowTargetSystem(this.world, this),
    ];

    physicsSystems.post = [createDeathSystem(this.world, Faction.Necro)];

    // initialize systems with overrides
    this.physicsSystems = buildPhysicsPipeline({
      world: this.world,
      scene: this,
      pre: physicsSystems.pre,
      post: physicsSystems.post,
    });

    this.tickSystems = buildTickPipeline();

    // reactive systems
    createHitSplatSystem(this.world, this);

    /** INITIALIZE ENTITIES */
    this.initializeEntities();

    this.events.once("shutdown", GameState.destroyGameState);
  }

  frameUpdate() {}

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    if (this.world.paused) return;
    profiler.start("FRAME_TIMER");
    this.timeSinceLastTick += delta;

    if (this.timeSinceLastTick > 200) {
      this.tickSystems(this.world);
      this.timeSinceLastTick = 0;
      if (GameState.isDebugMode()) profiler.logResults();
    }
    this.physicsSystems(this.world);
    profiler.end("FRAME_TIMER");
  }
}
