import {
  addComponent,
  createWorld,
  entityExists,
  getEntityComponents,
  getRelationTargets,
  hasComponent,
  observe,
  onAdd,
  removeComponent,
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
  CombatTarget,
  MoveTarget,
  type SteppableController,
} from "@necro-crown/shared";
import * as Components from "@necro-crown/shared/components";
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

  // steppable pipeline controller & metadata
  private systemsController?: SteppableController;
  private systemsInfo?: { name: string; enabled: boolean }[];
  private systemsDisplay = { currentSystem: "<idle>", stepping: false };

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
      reset: () => inspectEntity(inspector.eid),
    };

    const entityDetailsFolder = this.gui
      .addFolder("Entity Details")
      .close()
      .hide();
    entityDetailsFolder.add(inspector, "eid").listen();
    entityDetailsFolder.add(inspector, "reset");

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
      selectedComponent: "NONE",
      addComponent: () => {},
      removeComponent: () => {},
    };
    let componentPropsFolder = modifyComponentFolder.addFolder("Props");
    const componentRefs = new Map(
      Object.entries(Components).map(([name, ref]) => [name, ref]),
    );
    const componentNames = new Map(
      Object.entries(Components).map(([name, ref]) => [ref, name]),
    );

    let statsFolder = entityDetailsFolder.addFolder("Stats");

    let targetingFolder = entityDetailsFolder.addFolder("Targeting");
    const targets: {
      moveTarget: number | null;
      combatTarget: number | null;
    } = {
      moveTarget: null,
      combatTarget: null,
    };
    let targetSprite: GameObjects.Sprite | GameObjects.Rope | undefined =
      undefined;

    const inspectEntity = (eid: number) => {
      if (!entityExists(this.world, eid)) return;
      /* BASIC INFO */
      inspector.eid = eid;
      inspector.health = Health.current[eid];
      inspector.xPos = Position.x[eid];
      inspector.yPos = Position.y[eid];

      entityDetailsFolder.open().show();

      /* TARGETING */
      targetingFolder.destroy();
      targets.moveTarget = null;
      targets.combatTarget = null;
      targetingFolder = entityDetailsFolder.addFolder("Targets");
      const targetButtons = {
        inspectCombatTarget: () =>
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
        targetSprite?.setAlpha(1);
        targetSprite = this.spriteMap.get(targets.combatTarget);
        targetSprite?.setAlpha(0.5);

        targetingFolder
          .add(targets, "combatTarget")
          .listen()
          .onChange(() => {
            targetSprite?.setAlpha(1);
          });

        targetingFolder.add(targetButtons, "inspectCombatTarget");
      }

      /** ALL COMPONENTS */
      modifyComponentFolder.destroy();
      modifyComponentFolder = entityDetailsFolder.addFolder(
        "Add / Remove Components",
      );
      componentOptions.selectedComponent = "NONE";
      componentOptions.addComponent = () => {};
      componentOptions.removeComponent = () => {};
      modifyComponentFolder
        .add(componentOptions, "selectedComponent", Object.keys(Components))
        .onChange((value: string) => {
          if (!inspector.eid) return;
          componentPropsFolder.destroy();
          const component: any = componentRefs.get(value);
          if (!component) return;
          componentPropsFolder = modifyComponentFolder.addFolder(
            `${value} Options`,
          );

          const buildComponentProps = () => {
            const table: Record<string, any> = {};
            Object.keys(component).forEach((k) => {
              // only add if value is valid
              // if (component[k][inspector.eid] === undefined) return;
              table[k] = component[k][inspector.eid] || 0;
              componentPropsFolder.add(table, k).onChange((value: any) => {
                component[k][inspector.eid] = value;
              });
            });
            componentOptions.removeComponent = () => {
              removeComponent(this.world, inspector.eid, component);
              componentOptions.selectedComponent = "NONE";
              componentPropsFolder.destroy();
            };
            componentPropsFolder.add(componentOptions, "removeComponent");
          };

          if (!hasComponent(this.world, inspector.eid, component)) {
            componentOptions.addComponent = () => {
              if (!entityExists(this.world, inspector.eid)) return;
              componentPropsFolder.destroy();
              componentPropsFolder = modifyComponentFolder.addFolder(
                `${value} Options`,
              );
              addComponent(this.world, inspector.eid, component);
              buildComponentProps();
            };
            componentPropsFolder.add(componentOptions, "addComponent");
          } else {
            buildComponentProps();
          }
        })
        .listen();

      /* STATS */
      statsFolder.destroy();
      statsFolder = entityDetailsFolder.addFolder("Stats");

      const stats: Partial<Record<StatName, number>> = {};
      Object.keys(StatName).forEach((k) => {
        const statName = k as StatName;
        const stat = getStatComponentByName(statName);
        if (!hasComponent(this.world, eid, stat)) return;

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

    const systemEntries: { name: string; fn: (world?: World) => any }[] = [
      { name: "InputHandler", fn: () => createInputHandlerSystem() },
      { name: "GridSystem", fn: () => createGridSystem(this.world, map) },
      {
        name: "FollowTarget",
        fn: () => createFollowTargetSystem(this.world, this),
      },
      {
        name: "EmitUpgradeRequest",
        fn: () => createEmitUpgradeRequestEventSystem(this.world),
      },
      { name: "UpgradeSelection", fn: () => createUpgradeSelectionSystem() },
      {
        name: "HandleUpgradeSelect",
        fn: () => createHandleUpgradeSelectEventSystem(),
      },
      { name: "LevelUp", fn: () => createLevelUpSystem() },
      { name: "UnitSpawner", fn: () => createUnitSpawnerSystem() },
      {
        name: "DrawCollision",
        fn: () => createDrawCollisionSystem(this.world, this),
      },
      { name: "SeparationForce", fn: () => createSeparationForceSystem() },
      { name: "Movement", fn: () => createMovementSystem() },
      { name: "Cooldown", fn: () => createCooldownSystem() },
      { name: "Combat", fn: () => createCombatSystem() },
      {
        name: "ProjectileCollision",
        fn: () => createProjectileCollisionSystem(),
      },
      { name: "Spellcasting", fn: () => createSpellcastingSystem() },
      { name: "SpellEffect", fn: () => createSpellEffectSystem(this.world) },
      {
        name: "DrawSpellEffect",
        fn: () => createDrawSpellEffectSystem(this.world, this),
      },
      { name: "StatUpdate", fn: () => createStatUpdateSystem() },
      { name: "Health", fn: () => createHealthSystem() },
      { name: "DestroyAfterDelay", fn: () => createDestroyAfterDelaySystem() },
      { name: "Death", fn: () => createDeathSystem(this.world, Faction.Necro) },
      {
        name: "SpriteSystem",
        fn: () =>
          createSpriteSystem(
            this.world,
            this,
            this.spriteMap,
            Faction.Necro,
            true,
          ),
      },
      {
        name: "SpriteInteraction",
        fn: () => createSpriteInteractionSystem(this.world),
      },
      { name: "HealthBar", fn: () => createHealthBarSystem(this.world, this) },
    ];
    const systemsFolder = this.gui.addFolder("Systems");
    systemsFolder
      .add(this.systemsDisplay, "currentSystem")
      .name("current")
      .listen();
    systemsFolder
      .add(this.systemsDisplay, "stepping")
      .name("stepping")
      .listen()
      .onChange((v: boolean) => {
        controller.setStepping(Boolean(v));
      });
    systemsFolder.add({ step: () => controller.step() }, "step").name("Step");
    systemsFolder
      .add({ step4: () => controller.stepMany(4) }, "step4")
      .name("Step x4");

    const togglesFolder = systemsFolder.addFolder("Active Systems");

    const systemsInfo = systemEntries.map((e) => ({
      name: e.name,
      enabled: true,
    }));

    const systemFns = systemEntries.map((e, idx) => {
      const sys = e.fn();
      // only run enabled systems
      return (world: World) => {
        if (systemsInfo[idx].enabled) return sys(world);
        return world;
      };
    });
    systemsInfo.forEach((si, idx) => {
      togglesFolder
        .add(si, "enabled")
        .name(si.name)
        .onChange(() => {
          // reflect stepping flag in GUI display
          this.systemsDisplay.stepping = controller.stepping;
        });
    });
    togglesFolder.close();
    systemsFolder.open();

    this.events.on("destroy", () => {
      console.log("destroy scene");
      this.gui.destroy();
    });

    this.tickSystems = buildTickPipeline();

    const { run, controller } = createSteppablePipeline(systemFns);
    this.physicsSystems = run;
    this.systemsController = controller;
    this.systemsInfo = systemsInfo;

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
    if (
      this.systemsController &&
      this.systemsInfo &&
      this.systemsController.stepping
    ) {
      const len = this.systemsInfo.length;
      // last executed is currentIndex - 1 (wrap)
      const lastIndex =
        (((this.systemsController.currentIndex - 1) % len) + len) % len;
      this.systemsDisplay.currentSystem =
        this.systemsInfo[lastIndex]?.name ?? "<idle>";
      this.systemsDisplay.stepping = this.systemsController.stepping;
    }
    profiler.end("FRAME_TIMER");
  }
}
