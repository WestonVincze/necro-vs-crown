import {
  addComponent,
  createWorld,
  entityExists,
  getEntityComponents,
  getRelationTargets,
  hasComponent,
  observe,
  onAdd,
} from "bitecs";
import { GameObjects, Scene } from "phaser";
import { Grid } from "pathfinding";
import GUI from "lil-gui";
import {
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
  updateWorldTime,
  Position,
  Sprite,
  Health,
  getStatComponentByName,
  StatName,
  MaxHealth,
  createSteppablePipeline,
  AttackCooldown,
  CombatTarget,
  MoveTarget,
} from "@necro-crown/shared";
import * as Components from "@necro-crown/shared/components";
import * as Relations from "@necro-crown/shared/relations";
import {
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
import { initializePlaygroundControls } from "../../input/PlaygroundControls";

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
    this.world.paused = false;
    // this.world.experience = 0; // not yet used

    const { gridData, map } = buildTileMap(this);

    this.world.grid = new Grid(gridData);

    // initialize controls including spawn on click - enabled/disabled by setting
    initializePlaygroundControls(this, (x: number, y: number) => {
      if (!unitToSpawnParams.spawnOnClick) return false;

      createUnitEntity(this.world, unitToSpawnParams.name, x, y);
      return true;
    });

    // set up create entity buttons
    const unitToSpawnParams: {
      name: UnitName;
      x: number;
      y: number;
      spawnOnClick: boolean;
    } = {
      name: UnitName.Skeleton,
      x: 0,
      y: 0,
      spawnOnClick: false,
    };

    const buttons = {
      spawnUnit: () =>
        createUnitEntity(
          this.world,
          unitToSpawnParams.name,
          unitToSpawnParams.x,
          unitToSpawnParams.y,
        ),
      togglePause: () => (this.world.paused = !this.world.paused),
      tickUpdate: () => this.tickSystems(this.world),
      frameUpdate: () => this.physicsSystems(this.world),
    };

    /** PAUSE STATE */
    this.gui.add(this.world, "paused");

    /** FRAME / SYSTEM ADVANCERS */
    const frameFolder = this.gui.addFolder("Frame Advance");
    frameFolder.add(buttons, "tickUpdate");
    frameFolder.add(buttons, "frameUpdate");

    /** SPAWN UNITS */
    const unitFolder = this.gui.addFolder("Unit Spawn");
    unitFolder.add(unitToSpawnParams, "name", Object.keys(Units));
    unitFolder.add(unitToSpawnParams, "x");
    unitFolder.add(unitToSpawnParams, "y");
    unitFolder.add(unitToSpawnParams, "spawnOnClick");
    unitFolder.add(buttons, "spawnUnit");

    /** INSPECT UNIT */
    const inspector = {
      eid: 0,
      xPos: 0,
      yPos: 0,
      health: 0,
    };

    const entityDetailsFolder = this.gui.addFolder("Entity Details").close();
    entityDetailsFolder.add(inspector, "eid").listen();

    entityDetailsFolder
      .add(inspector, "health")
      .listen()
      .onChange((value: number) => {
        if (inspector.eid === 0) return;
        Health.current[inspector.eid] = value;
      });

    entityDetailsFolder
      .add(inspector, "xPos")
      .listen()
      .onChange((value: number) => {
        if (inspector.eid === 0) return;
        Position.x[inspector.eid] = value;
      });

    entityDetailsFolder
      .add(inspector, "yPos")
      .listen()
      .onChange((value: number) => {
        if (inspector.eid === 0) return;
        Position.y[inspector.eid] = value;
      });

    /* ADD / REMOVE components */
    let modifyComponentFolder = entityDetailsFolder.addFolder(
      "Add / Remove Components",
    );
    const componentOptions = {
      selected: "NONE",
      handleAdd: () => {
        // folder add
      },
      handleRemove: () => {
        // remove compon
      },
    };
    let componentPropsFolder = modifyComponentFolder.addFolder("Props");
    const componentRefs = new Map(
      Object.entries(Components).map(([name, ref]) => [name, ref]),
    );
    const componentNames = new Map(
      Object.entries(Components).map(([name, ref]) => [ref, name]),
    );

    let statsFolder = entityDetailsFolder.addFolder("Stats");

    let targetingFolder = this.gui.addFolder("Targeting");

    const inspectEntity = (eid: number) => {
      if (!entityExists(this.world, eid)) return;
      /* BASIC INFO */
      inspector.eid = eid;
      inspector.health = Health.current[eid];
      inspector.xPos = Position.x[eid];
      inspector.yPos = Position.y[eid];

      entityDetailsFolder.open();

      /* TARGETING */
      targetingFolder.destroy();
      targetingFolder = entityDetailsFolder.addFolder("Targets");
      const targets: {
        moveTarget: number | null;
        combatTarget: number | null;
      } = {
        moveTarget: null,
        combatTarget: null,
      };
      const inspect = {
        combatTarget: () =>
          targets.combatTarget && inspectEntity(targets.combatTarget),
      };
      if (hasComponent(this.world, eid, MoveTarget("*"))) {
        targets.moveTarget = getRelationTargets(this.world, eid, MoveTarget)[0];
        targetingFolder.add(targets, "moveTarget").listen();
      }
      if (hasComponent(this.world, eid, CombatTarget("*"))) {
        targets.combatTarget = getRelationTargets(
          this.world,
          eid,
          CombatTarget,
        )[0];
        const targetSprite = this.spriteMap.get(targets.combatTarget);
        targetSprite?.setAlpha(0.5);

        targetingFolder
          .add(targets, "combatTarget")
          .listen()
          .onChange(() => {
            targetSprite?.setAlpha(1);
          });

        targetingFolder.add(inspect, "combatTarget");
      }

      /** ALL COMPONENTS */
      modifyComponentFolder.destroy();
      modifyComponentFolder = entityDetailsFolder.addFolder(
        "Add / Remove Components",
      );
      modifyComponentFolder
        .add(componentOptions, "selected", Object.keys(Components))
        .onChange((value: string) => {
          if (!inspector.eid) return;
          componentPropsFolder.destroy();
          componentPropsFolder = modifyComponentFolder.addFolder("Props");

          const component: any = componentRefs.get(value);

          const table: Record<string, any> = {};
          if (!hasComponent(this.world, inspector.eid, component)) return;
          Object.keys(component).forEach((k) => {
            table[k] = component[k][inspector.eid];
            componentPropsFolder.add(table, k);
          });
        });

      /* STATS */
      statsFolder.destroy();
      statsFolder = entityDetailsFolder.addFolder("Stats");

      const stats: Partial<Record<StatName, number>> = {};
      Object.keys(StatName).forEach((k) => {
        const statName = k as StatName;
        const stat = getStatComponentByName(statName);

        stats[statName as StatName] = stat.current[eid];

        if (stats[statName] === undefined) return;

        statsFolder
          .add(stats, statName)
          .listen()
          .onChange((value: number) => {
            if (inspector.eid === 0) return;
            if (!hasComponent(this.world, inspector.eid, stat)) {
              addComponent(this.world, inspector.eid, stat);
            }
            stat.current[inspector.eid] = value;
            stat.base[inspector.eid] = value;
            if (stat === MaxHealth) {
              const diff =
                MaxHealth.current[inspector.eid] - Health.max[inspector.eid];
              Health.max[inspector.eid] = MaxHealth.current[inspector.eid];
              Health.current[inspector.eid] += diff;
              inspector.health = Health.current[inspector.eid];
            }
          });
      });

      // print entity components
      const components = getEntityComponents(this.world, eid);

      console.groupCollapsed(`Components for entity ${eid}`);
      for (const component of components) {
        const name = componentNames.get(component) ?? "Unknown";
        // skip unknown components
        if (name === "Unknown") continue;
        const table: Record<string, any> = {};
        Object.keys(component).forEach((k) => {
          table[k] = component[k][eid];
        });
        console.group(
          `%c ${name}`,
          "background:#111;color:#fff;padding:12px 12px;border-radius:3px;font-weight:600",
        );
        console.table(table);
        console.groupEnd();
      }
      console.groupEnd();
    };

    /** INSPECT ON CLICK */
    const createSpriteInteractionSystem = (world: World) => {
      const spriteEnterQueue: number[] = [];
      observe(world, onAdd(Sprite), (eid) => spriteEnterQueue.push(eid));

      return (world: World) => {
        for (const eid of spriteEnterQueue.splice(0)) {
          const sprite = this.spriteMap.get(eid);
          sprite?.on("pointerdown", () => {
            inspectEntity(eid);
          });
        }

        return world;
      };
    };

    this.events.on("destroy", () => {
      console.log("destroy scene");
      this.gui.destroy();
    });

    this.tickSystems = buildTickPipeline();

    const { run, controller } = createSteppablePipeline([
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
      createCooldownSystem(),
      createCombatSystem(),
      createProjectileCollisionSystem(),
      createSpellcastingSystem(),
      createSpellEffectSystem(this.world),
      createDrawSpellEffectSystem(this.world, this),
      createStatUpdateSystem(),
      createHealthSystem(),
      createDestroyAfterDelaySystem(),
      createDeathSystem(this.world, Faction.Necro),
      createSpriteSystem(this.world, this, this.spriteMap, Faction.Necro, true),
      createSpriteInteractionSystem(this.world),
      createHealthBarSystem(this.world, this),
    ]);
    this.physicsSystems = run;

    // reactive systems
    createHitSplatSystem(this.world, this);

    /** INITIALIZE ENTITIES */
    this.initializeEntities();

    this.events.once("shutdown", GameState.destroyGameState);
  }

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    updateWorldTime(this.world);
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
