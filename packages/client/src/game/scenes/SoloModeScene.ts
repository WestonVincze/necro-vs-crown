import {
  addComponent,
  addEntity,
  createWorld,
  getAllEntities,
  getEntityComponents,
  pipe,
} from "bitecs";
import { Scene } from "phaser";
import {
  type Pipeline,
  Player,
  createCursorTargetSystem,
  createInputHandlerSystem,
  createMovementSystem,
  createTargetingSystem,
  createUnitEntity,
  createFollowTargetSystem,
  createSpriteSystem,
  createCollisionSystem,
  createItemEquipSystem,
  createBonesEntity,
  createSpellcastingSystem,
  createSpellEffectSystem,
  createDrawSpellEffectSystem,
  createHealthBarSystem,
  createCombatSystem,
  createHealthSystem,
  createDeathSystem,
  createCooldownSystem,
  createHitSplatSystem,
  Faction,
  Behavior,
  Behaviors,
  createAssignFollowTargetSystem,
  createGridSystem,
  createTimeSystem,
  createAIEventsSystem,
  createDestroyAfterDelaySystem,
  createProjectileCollisionSystem,
  createDrawCollisionSystem,
  createUnitSpawnerSystem,
  BuildingSpawner,
  createTargetSpawnerEntity,
  createStatUpdateSystem,
  createLevelUpSystem,
  createUpgradeSelectionSystem,
  createEmitUpgradeRequestEventSystem,
  createHandleUpgradeSelectEventSystem,
  UnitName,
  Level,
  CoinAccumulator,
  Coin,
  createAutoSummonSkeletonsSystem,
  createSeparationForceSystem,
} from "@necro-crown/shared";
import { createCameraControlSystem } from "$game/systems";
import {
  BASE_EXP,
  MAP_X_MAX,
  MAP_X_MIN,
  MAP_Y_MAX,
  MAP_Y_MIN,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "@necro-crown/shared/src/constants";
import { type World, GameState } from "@necro-crown/shared";
import { profiler } from "@necro-crown/shared/src/utils";

type System = (world: World) => World;

type PipelineFactory = {
  scene: Scene;
  pre?: System[];
  post?: System[];
};

const createPhysicsPipeline = ({
  scene,
  pre = [],
  post = [],
}: PipelineFactory) =>
  pipe(
    ...pre,
    createEmitUpgradeRequestEventSystem(),
    createUpgradeSelectionSystem(),
    createHandleUpgradeSelectEventSystem(),
    createLevelUpSystem(),
    createUnitSpawnerSystem(),
    createDrawCollisionSystem(scene),
    createSeparationForceSystem(),
    createMovementSystem(),
    createSpriteSystem(scene),
    // createFollowTargetSystem(scene),
    createCooldownSystem(),
    createCombatSystem(),
    // createCollisionSystem(),
    createProjectileCollisionSystem(),
    createSpellcastingSystem(),
    createSpellEffectSystem(),
    createDrawSpellEffectSystem(scene),
    createStatUpdateSystem(),
    createHealthSystem(),
    createHealthBarSystem(scene),
    createDestroyAfterDelaySystem(),
    createDeathSystem(),
    ...post,
    createTimeSystem(), // time should always be last
  );

const createReactivePipeline = ({
  scene,
  pre = [],
  post = [],
}: PipelineFactory) =>
  pipe(
    ...pre,
    createAIEventsSystem(),
    createHitSplatSystem(scene),
    // createHealthSystem(),
    createItemEquipSystem(),
    ...post,
  );

const createTickPipeline = ({ pre = [], post = [] }: PipelineFactory) =>
  pipe(
    ...pre,
    createTargetingSystem(),
    createAssignFollowTargetSystem(),
    ...post,
  );

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */
  private playerType!: Faction;

  private camera!: Phaser.Cameras.Scene2D.Camera;

  // entity container (context)
  private world!: World;

  // system references
  private reactiveSystems!: Pipeline;
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  public globalState: any;

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

    // create base systems
    let physicsSystems: { pre: System[]; post: System[] } = {
      pre: [],
      post: [],
    };
    let reactiveSystems: { pre: System[]; post: System[] } = {
      pre: [],
      post: [],
    };
    let tickSystems: { pre: System[]; post: System[] } = { pre: [], post: [] };

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

    // somehow this is necessary to prevent a bug with targeting
    const zero = addEntity(this.world);

    // Faction specific configurations
    switch (this.playerType) {
      case Faction.Crown:
        // create player
        const crown = addEntity(this.world);
        addComponent(this.world, Player, crown);
        addComponent(this.world, Level, crown);
        Level.currentLevel[crown] = 0;
        Level.currentExp[crown] = 0;
        Level.expToNextLevel[crown] = BASE_EXP;
        addComponent(this.world, Coin, crown);
        addComponent(this.world, CoinAccumulator, crown);
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
          addComponent(this.world, Behavior, eid);
          Behavior.type[eid] = Behaviors.AutoTarget;
        }

        // system overrides
        physicsSystems.pre = [
          createGridSystem(map),
          createFollowTargetSystem(this, gridData),
          createAutoSummonSkeletonsSystem(),
        ];

        reactiveSystems.pre = [createCameraControlSystem(this)];
        break;

      case Faction.Necro:
        // create Necro player
        const necro = createUnitEntity(
          this.world,
          UnitName.Necromancer,
          300,
          300,
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

        // system overrides
        physicsSystems.pre = [
          createInputHandlerSystem(),
          createGridSystem(map),
          createFollowTargetSystem(this, gridData),
        ];

        reactiveSystems.pre = [createCursorTargetSystem(this)];
        break;
    }

    // initialize systems with overrides
    this.physicsSystems = createPhysicsPipeline({
      scene: this,
      pre: physicsSystems.pre,
      post: physicsSystems.post,
    });

    this.reactiveSystems = createReactivePipeline({
      scene: this,
      pre: reactiveSystems.pre,
      post: reactiveSystems.post,
    });

    this.tickSystems = createTickPipeline({
      scene: this,
      pre: tickSystems.pre,
      post: tickSystems.post,
    });

    /** RUN REACTIVE SYSTEMS */
    this.reactiveSystems(this.world);

    /** RUN TICK SYSTEMS */
    setInterval(() => {
      if (GameState.isPaused()) return;

      this.tickSystems(this.world);
      if (GameState.isDebugMode()) profiler.logResults();
    }, 200);

    // this.events.once("shutdown", GameState.destroyGameState, this);
    // this.events.once("destroy", GameState.destroyGameState, this);
  }

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    if (GameState.isPaused()) return;

    profiler.start("FRAME_TIMER");
    this.physicsSystems(this.world);
    profiler.end("FRAME_TIMER");
  }
}
