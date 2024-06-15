import { addComponent, createWorld, getAllEntities, getEntityComponents, pipe, type IWorld, type System } from "bitecs";
import { GameObjects, Scene, type Types } from "phaser";
import { type World, type Pipeline, Player, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createFollowTargetSystem, createSpriteSystem, createCollisionSystem, createItemEquipSystem, createItemEntity, Collider, CollisionLayers, Inventory, createBonesEntity, createSpellcastingSystem, createDrawSpellEffectSystem, Spell, SpellState, createHealthBarSystem, timeSystem, createCombatSystem, createHealthSystem, createDeathSystem, createCooldownSystem, createHitSplatSystem, Faction, Behavior, Behaviors, createAssignFollowTargetSystem } from "@necro-crown/shared";
import { defineAction } from "../../input/Actions";
import { crownState$, playCard } from "$game/Crown";

type PipelineFactory = {
  scene: Scene,
  pre?: System[],
  post?: System[]
}

const createPhysicsPipeline = ({ scene, pre = [], post = [] }: PipelineFactory) => pipe(
  ...pre,
  createMovementSystem(),
  createSpriteSystem(scene),
  createFollowTargetSystem(),
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

  constructor() {
    super("SoloModeScene");
  }

  init(data: { player: Faction}) {
    // ensure input is enabled in config
    this.camera = this.cameras.add();
    this.playerType = data.player;
  }

  create() {
    // instantiate world
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };

    // create base systems
    let physicsSystems: { pre: System[], post: System[] } = { pre: [], post: [] };
    let reactiveSystems: { pre: System[], post: System[] } = { pre: [], post: [] };
    let tickSystems: { pre: System[], post: System[] } = { pre: [], post: [] };

    /** DEBUG CONSOLE  **/
    // @ts-ignore
    // PhaserGUIAction(this);

    /** Add global debug functions */
    (window as any).getEntities = () => getAllEntities(this.world);
    (window as any).getEntityComponents = (eid: number) => getEntityComponents(this.world, eid);

    // Faction specific configurations
    switch (this.playerType) {
      case Faction.Crown:
        defineAction({
          name: 'mouseAction',
          callback: (event) => {
            const { selectedCard } = crownState$.value;
            if (selectedCard === null) return;

            const rect = document.getElementById("game-container")?.getBoundingClientRect();
            if (!rect) return;

            const { left, top } = rect;
            const mouseEvent = event as MouseEvent | DragEvent

            const xPos = mouseEvent.x - left;
            const yPos = mouseEvent.y - top;

            playCard(() => {
              createUnitEntity(this.world, selectedCard.UnitID, xPos, yPos)
            });
          },
          binding: { mouseEvents: ["mouseup", "dragend"] }
        })

        // create starting units
        for (let i = 0; i < 5; i++) {
          const eid = createUnitEntity(this.world, "Skeleton", Math.random() * 1024, Math.random() * 1024);
          addComponent(this.world, Behavior, eid);
          Behavior.type[eid] = Behaviors.AutoTarget;
        }

        // system overrides
        physicsSystems.pre = [

        ]

        reactiveSystems.pre = [
          createDeathSystem(this.playerType),
        ]
        break;

      case Faction.Necro:
        // create Necro player 
        const eid = createUnitEntity(this.world, "Necromancer", 300, 300);
        addComponent(this.world, Player, eid);
        addComponent(this.world, Spell, eid);
        Spell.state[eid] = SpellState.Ready;

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
        ]

        reactiveSystems.pre = [
          createCursorTargetSystem(this.world),
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
  }

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    this.physicsSystems(this.world);
  }
}