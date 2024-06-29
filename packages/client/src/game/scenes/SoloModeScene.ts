import { addComponent, createWorld, getAllEntities, getEntityComponents, pipe, type System } from "bitecs";
import { Scene } from "phaser";
import { type World, type Pipeline, Player, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createFollowTargetSystem, createSpriteSystem, createCollisionSystem, createItemEquipSystem, createBonesEntity, createSpellcastingSystem, createDrawSpellEffectSystem, Spell, SpellState, createHealthBarSystem, timeSystem, createCombatSystem, createHealthSystem, createDeathSystem, createCooldownSystem, createHitSplatSystem, Faction, Behavior, Behaviors, createAssignFollowTargetSystem, createGridSystem, SpellName } from "@necro-crown/shared";
// @ts-expect-error - no declaration file
import * as dat from 'dat.gui';
import { createCameraControlSystem } from "$game/systems";

type PipelineFactory = {
  scene: Scene,
  pre?: System[],
  post?: System[]
}

const createPhysicsPipeline = ({ scene, pre = [], post = [] }: PipelineFactory) => pipe(
  ...pre,
  createMovementSystem(),
  createSpriteSystem(scene),
  // createFollowTargetSystem(scene),
  createCooldownSystem(),
  createCombatSystem(),
  createCollisionSystem(),
  createSpellcastingSystem(),
  createDrawSpellEffectSystem(scene),
  createHealthBarSystem(scene),
  ...post,
  timeSystem, // time should always be last
);

const createReactivePipeline = ({ scene, pre = [], post = [] }: PipelineFactory) => pipe( 
  ...pre,
  createHitSplatSystem(scene),
  createHealthSystem(),
  createItemEquipSystem(),
  ...post
);

const createTickPipeline = ({ pre = [], post = [] }: PipelineFactory) => pipe(
  ...pre,
  createTargetingSystem(),
  createAssignFollowTargetSystem(),
  ...post
)

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */
  private playerType!: Faction;

  private camera!: Phaser.Cameras.Scene2D.Camera;

  // entity container (context)
  private world!: World

  // system references
  private reactiveSystems!: Pipeline;
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  public gui: typeof dat.gui; 

  constructor() {
    super("SoloModeScene");
  }

  init(data: { player: Faction}) {
    // ensure input is enabled in config
    this.playerType = data.player;
    this.camera = this.cameras.main;
  }

  create() {
    // instantiate world
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };

    // create base systems
    let physicsSystems: { pre: System[], post: System[] } = { pre: [], post: [] };
    let reactiveSystems: { pre: System[], post: System[] } = { pre: [], post: [] };
    let tickSystems: { pre: System[], post: System[] } = { pre: [], post: [] };

    this.gui = new dat.GUI();

    const main = this.gui.addFolder("Main Camera");
    main.add(this.camera, 'scrollX').listen();
    main.add(this.camera, 'scrollY').listen();

    /** Add global debug functions */
    (window as any).getEntities = () => getAllEntities(this.world);
    (window as any).getEntityComponents = (eid: number) => getEntityComponents(this.world, eid);

    /** Set up testing Tilemap - 3x screen size */
    this.camera.setBounds(-1536, -1152, 3072, 2304);
    const map = this.make.tilemap({ key: 'map' });
    map.addTilesetImage('sample', 'sample');
    map.createLayer("Ground", "sample", -1536, -1152);
    // map.createLayer("Roads", "sample", -1536, -1152);
    map.createLayer("Objects", "sample", -1536, -1152);

    // test grid data
    let gridData = [];
    for (let y = 0; y < map.height; y++) {
      let row = [];
      for (let x = 0; x < map.width; x++) {
        row.push(map.hasTileAt(x, y, "Objects") ? 1 : 0);
      }
      gridData.push(row);
    }

    // Faction specific configurations
    switch (this.playerType) {
      case Faction.Crown:
        // create starting units
        for (let i = 0; i < 5; i++) {
          const eid = createUnitEntity(this.world, "Skeleton", Math.random() * 1024, Math.random() * 1024);
          addComponent(this.world, Behavior, eid);
          Behavior.type[eid] = Behaviors.AutoTarget;
        }

        // system overrides
        physicsSystems.pre = [
          createGridSystem(map),
          createFollowTargetSystem(this, gridData)
        ]

        reactiveSystems.pre = [
          createCameraControlSystem(this),
          createDeathSystem(this.playerType),
        ]
        break;

      case Faction.Necro:
        // create Necro player 
        const eid = createUnitEntity(this.world, "Necromancer", 300, 300);
        addComponent(this.world, Player, eid);
        addComponent(this.world, Spell, eid);
        Spell.state[eid] = SpellState.Ready;
        Spell.name[eid] = SpellName.HolyNova;

        // create Bones entity (for testing)
        createBonesEntity(this.world, 500, 500);

        for (let i = 0; i < 30; i++) {
          const randomEntity = Math.random() > 0.5 ? "Peasant" : "Skeleton";
          const eid = createUnitEntity(this.world, randomEntity, Math.random() * 1024, Math.random() * 1024);

          if (randomEntity === "Skeleton") {
            Behavior.type[eid] = Behaviors.FollowCursor;
          } 
        }

        // system overrides
        physicsSystems.pre = [
          createInputHandlerSystem(),
          createGridSystem(map),
          createFollowTargetSystem(this, gridData)
        ]

        reactiveSystems.pre = [
          createCursorTargetSystem(this),
          createDeathSystem(this.playerType),
        ]
        break;
    }

    // initialize systems with overrides
    this.physicsSystems = createPhysicsPipeline({
      scene: this,
      pre: physicsSystems.pre,
      post: physicsSystems.post
    });

    this.reactiveSystems = createReactivePipeline({
      scene: this,
      pre: reactiveSystems.pre,
      post: reactiveSystems.post
    });

    this.tickSystems = createTickPipeline({
      scene: this,
      pre: tickSystems.pre,
      post: tickSystems.post
    });

    /** RUN REACTIVE SYSTEMS */
    this.reactiveSystems(this.world);

    /** RUN TICK SYSTEMS */
    setInterval(() => {
      this.tickSystems(this.world);
    }, 200);

    // this.events.once('shutdown', this.destroyResources, this);
    this.events.once('destroy', this.destroyResources, this);
  }

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    this.physicsSystems(this.world);
  }

  destroyResources() {
    this.gui.destroy();
    this.gui = null;
  }
}