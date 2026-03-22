import { addComponent, addEntity, createWorld } from "bitecs";
import { Scene } from "phaser";
import { Grid } from "pathfinding";
import {
  type System,
  Player,
  createUnitEntity,
  createFollowTargetSystem,
  createBonesEntity,
  Faction,
  Behavior,
  Behaviors,
  createGridSystem,
  createTargetSpawnerEntity,
  UnitName,
  Level,
  CoinAccumulator,
  Coin,
  createDeathSystem,
  createHitSplatSystem,
  GameEvents,
  type Pipeline,
  BASE_EXP,
  MAP_X_MAX,
  MAP_X_MIN,
  MAP_Y_MAX,
  MAP_Y_MIN,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  type World,
  GameState,
  profiler,
} from "@necro-crown/shared";
import {
  initializeNecroMouseControls,
  initializeCrownMouseControls,
  createInputHandlerSystem,
} from "$game/systems";
import { buildPhysicsPipeline, buildTickPipeline } from "$game/pipelines";

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */
  private playerType!: Faction;

  private camera!: Phaser.Cameras.Scene2D.Camera;

  // entity container (context)
  private world!: World;

  private initializeEntities: () => void = () => {};

  // system references
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  private timeSinceLastTick: number = 0;

  constructor() {
    super("SoloModeScene");
  }

  init(data: { player: Faction }) {
    // ensure input is enabled in config
    this.playerType = data.player;
    this.camera = this.cameras.main;
  }

  create() {
    // instantiate world
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.gameEvents = new GameEvents();

    // create base systems
    let physicsSystems: { pre: System[]; post: System[] } = {
      pre: [],
      post: [],
    };

    /* 
    const { gui } = GameState;

    const main = gui.addFolder("Main Camera");
    main.add(this.camera, "scrollX").listen();
    main.add(this.camera, "scrollY").listen();

    const entityData = gui.addFolder("Entity Data");
    const entityMethods = {
      printEntities: () => console.log(getAllEntities(this.world)),
      printComponents: () =>
        getAllEntities(this.world).forEach((eid) =>
          console.log(getEntityComponents(this.world, eid)),
        ),
    };
    entityData.add(entityMethods, "printEntities").name("Print Entities");
    entityData
      .add(entityMethods, "printComponents")
      .name("Print Entity Components");
    */

    /** Add global debug functions */
    /*
    (window as any).getEntities = () => getAllEntities(this.world);
    (window as any).getEntityComponents = (eid: number) => getEntityComponents(this.world, eid);
    */

    /** Set up testing Tilemap - 3x screen size */
    this.camera.setBounds(MAP_X_MIN, MAP_Y_MIN, MAP_X_MAX, MAP_Y_MAX);
    const map = this.make.tilemap({ key: "map" });
    map.addTilesetImage("sample", "sample");
    map.createLayer("Ground", "sample", MAP_X_MIN, MAP_Y_MIN);
    map.createLayer("Roads", "sample", MAP_X_MIN, MAP_Y_MIN);
    map.createLayer("Objects", "sample", MAP_X_MIN, MAP_Y_MIN);

    // test grid data
    let gridData = [];
    for (let y = 0; y < map.height; y++) {
      let row = [];
      for (let x = 0; x < map.width; x++) {
        row.push(map.hasTileAt(x, y, "Objects") ? 1 : 0);
      }
      gridData.push(row);
    }

    this.world.grid = new Grid(gridData);

    // Faction specific configurations
    switch (this.playerType) {
      case Faction.Crown:
        this.initializeEntities = () => {
          // create player
          const crown = addEntity(this.world);
          addComponent(this.world, crown, Player);
          addComponent(this.world, crown, Level);
          Level.currentLevel[crown] = 0;
          Level.currentExp[crown] = 0;
          Level.expToNextLevel[crown] = BASE_EXP;
          addComponent(this.world, crown, Coin);
          addComponent(this.world, crown, CoinAccumulator);
          Coin.current[crown] = 0;
          Coin.max[crown] = 10;
          CoinAccumulator.amount[crown] = 1;
          CoinAccumulator.frequency[crown] = 1000;

          // create starting units
          for (let i = 0; i < 5; i++) {
            const eid = createUnitEntity(
              this.world,
              UnitName.Skeleton,
              Math.random() * SCREEN_HEIGHT,
              Math.random() * SCREEN_WIDTH,
            );
            addComponent(this.world, eid, Behavior);
            Behavior.type[eid] = Behaviors.AutoTarget;
          }
        };
        // system overrides
        physicsSystems.pre = [
          createGridSystem(this.world, map),
          createFollowTargetSystem(this.world, this),
        ];

        physicsSystems.post = [createDeathSystem(this.world, Faction.Crown)];

        initializeCrownMouseControls(this, (name, x, y) =>
          createUnitEntity(this.world, name, x, y),
        );
        break;

      case Faction.Necro:
        this.initializeEntities = () => {
          // create Necro player
          const necro = createUnitEntity(
            this.world,
            UnitName.Necromancer,
            500,
            500,
          );

          // create Bones entity (for testing)
          createBonesEntity(this.world, 500, 500);

          createTargetSpawnerEntity(this.world, necro);
          for (let i = 0; i < 10; i++) {
            const randomEntity =
              Math.random() > 0.5 ? UnitName.Peasant : UnitName.Skeleton;
            const eid = createUnitEntity(
              this.world,
              randomEntity,
              Math.random() * 1024,
              Math.random() * 1024,
            );

            if (randomEntity === UnitName.Skeleton) {
              Behavior.type[eid] = Behaviors.FollowCursor;
            }
          }
        };

        // system overrides
        physicsSystems.pre = [
          createInputHandlerSystem(),
          createGridSystem(this.world, map),
          createFollowTargetSystem(this.world, this),
        ];

        physicsSystems.post = [createDeathSystem(this.world, Faction.Necro)];

        initializeNecroMouseControls(this.world, this);
        break;
    }

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

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    if (GameState.isPaused()) return;
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
