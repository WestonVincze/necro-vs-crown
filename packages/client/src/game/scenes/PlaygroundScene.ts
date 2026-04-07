import {
  addComponent,
  createWorld,
  entityExists,
  hasComponent,
  observe,
  onAdd,
} from "bitecs";
import { GameObjects, Scene } from "phaser";
import { Grid } from "pathfinding";
import GUI from "lil-gui";
import {
  type System,
  createUnitEntity,
  Faction,
  UnitName,
  createDeathSystem,
  GameEvents,
  type Pipeline,
  type World,
  profiler,
  Units,
  pipeline,
  createEmitUpgradeRequestEventSystem,
  createUpgradeSelectionSystem,
  createHandleUpgradeSelectEventSystem,
  createLevelUpSystem,
  createUnitSpawnerSystem,
  createSeparationForceSystem,
  createMovementSystem,
  createCooldownSystem,
  createCombatSystem,
  createProjectileCollisionSystem,
  createSpellcastingSystem,
  createSpellEffectSystem,
  createStatUpdateSystem,
  createHealthSystem,
  createDestroyAfterDelaySystem,
  createTimeSystem,
  Position,
  Sprite,
  Health,
  getStatComponentByName,
  StatName,
} from "@necro-crown/shared";
import {
  initializeCrownMouseControls,
  createInputHandlerSystem,
  createHitSplatSystem,
  createGridSystem,
  createFollowTargetSystem,
  createDrawCollisionSystem,
  createSpriteSystem,
  createDrawSpellEffectSystem,
  createHealthBarSystem,
} from "$game/systems";
import { GameState } from "$game/managers";
import { buildTickPipeline } from "$game/pipelines";
import { buildTileMap } from "../../helpers/TileMap";

export class PlaygroundScene extends Scene {
  private world!: World;
  private gui: GUI;

  private initializeEntities: () => void = () => {};

  // system references
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  // map of eid to sprite reference
  private spriteMap = new Map<number, GameObjects.Sprite | GameObjects.Rope>();
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

    const frameFolder = this.gui.addFolder("Frame Advance");
    frameFolder.add(buttons, "tickUpdate");
    frameFolder.add(buttons, "frameUpdate");

    const unitFolder = this.gui.addFolder("Unit Spawn");
    unitFolder.add(unitToSpawn, "name", Object.keys(Units));
    unitFolder.add(unitToSpawn, "x");
    unitFolder.add(unitToSpawn, "y");
    unitFolder.add(buttons, "spawnUnit");

    const inspector = {
      eid: 0,
      xPos: 0,
      yPos: 0,
      health: 0,
    };

    const componentsFolder = this.gui.addFolder("Components");
    componentsFolder.add(inspector, "eid").listen();

    componentsFolder
      .add(inspector, "health")
      .listen()
      .onChange((value: number) => {
        if (inspector.eid === 0) return;
        Health.current[inspector.eid] = value;
      });

    componentsFolder
      .add(inspector, "xPos")
      .listen()
      .onChange((value: number) => {
        if (inspector.eid === 0) return;
        Position.x[inspector.eid] = value;
      });

    componentsFolder
      .add(inspector, "yPos")
      .listen()
      .onChange((value: number) => {
        if (inspector.eid === 0) return;
        Position.y[inspector.eid] = value;
      });

    const statsFolder = componentsFolder.addFolder("Stats");

    const stats: Partial<Record<StatName, number>> = {};
    Object.keys(StatName).forEach((k) => {
      stats[k as StatName] = 0;

      statsFolder
        .add(stats, k as StatName)
        .listen()
        .onChange((value: number) => {
          if (inspector.eid === 0) return;
          const component = getStatComponentByName(k as StatName);
          if (!hasComponent(this.world, inspector.eid, component)) {
            addComponent(this.world, inspector.eid, component);
          }
          component.current[inspector.eid] = value;
          component.base[inspector.eid] = value;
        });
    });

    const createSpriteInteractionSystem = (world: World) => {
      const spriteEnterQueue: number[] = [];
      observe(world, onAdd(Sprite), (eid) => spriteEnterQueue.push(eid));

      return (world: World) => {
        for (const eid of spriteEnterQueue.splice(0)) {
          const sprite = this.spriteMap.get(eid);
          sprite?.on("pointerdown", () => {
            console.log(eid);
            inspector.eid = eid;
            if (!entityExists(this.world, eid)) return;

            inspector.health = Health.current[eid];
            inspector.xPos = Position.x[eid];
            Object.keys(StatName).forEach((k) => {
              stats[k as StatName] = getStatComponentByName(
                k as StatName,
              ).current[eid];
            });
          });
        }

        return world;
      };
    };

    this.events.on("destroy", () => {
      console.log("destroy scene");
      this.gui.destroy();
    });

    this.physicsSystems = pipeline([
      createInputHandlerSystem(),
      createGridSystem(this.world, map),
      createFollowTargetSystem(this.world, this),
      createEmitUpgradeRequestEventSystem(this.world),
      createUpgradeSelectionSystem(),
      createHandleUpgradeSelectEventSystem(), // subscribes to game events...
      createLevelUpSystem(),
      createUnitSpawnerSystem(),
      createDrawCollisionSystem(this.world, this),
      createSeparationForceSystem(),
      createMovementSystem(),
      createSpriteSystem(this.world, this, this.spriteMap, Faction.Necro, true),
      createSpriteInteractionSystem(this.world),
      createCooldownSystem(),
      createCombatSystem(),
      createProjectileCollisionSystem(),
      createSpellcastingSystem(),
      createSpellEffectSystem(this.world),
      createDrawSpellEffectSystem(this.world, this),
      createStatUpdateSystem(),
      createHealthSystem(),
      createHealthBarSystem(this.world, this),
      createDestroyAfterDelaySystem(),
      createDeathSystem(this.world, Faction.Necro),
      createTimeSystem(),
    ]);

    this.tickSystems = buildTickPipeline();

    // reactive systems
    createHitSplatSystem(this.world, this);

    /** INITIALIZE ENTITIES */
    this.initializeEntities();

    this.events.once("shutdown", GameState.destroyGameState);
  }

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
