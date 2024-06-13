import { addComponent, createWorld, getAllEntities, getEntityComponents, pipe } from "bitecs";
import { GameObjects, Scene, type Types } from "phaser";
import { type World, type Pipeline, Player, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createFollowTargetSystem, createSpriteSystem, createCollisionSystem, createItemEquipSystem, createItemEntity, Collider, CollisionLayers, Inventory, createBonesEntity, createSpellcastingSystem, createDrawSpellEffectSystem, Spell, SpellState, createHealthBarSystem, timeSystem, createCombatSystem, createHealthSystem, createDeathSystem, createCooldownSystem, createHitSplatSystem, Faction } from "@necro-crown/shared";
import { defineAction } from "../../input/Actions";
import { crownState$, playCard } from "$game/Crown";

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */
  private playerType!: Faction;

  private camera!: Phaser.Cameras.Scene2D.Camera;
  private cursors!: Types.Input.Keyboard.CursorKeys;

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
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.camera = this.cameras.add();
    this.playerType = data.player;
  }

  rope!: GameObjects.Rope;

  create() {
    if (this.playerType === Faction.Crown) { 
      // show card UI
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
    }
    /** DEBUG CONSOLE 
    //@ts-ignore
    PhaserGUIAction(this);
    */
    console.log("creating solo mode");
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };

    /** Add global debug functions */
    (window as any).getEntities = () => getAllEntities(this.world);
    (window as any).getEntityComponents = (eid: number) => getEntityComponents(this.world, eid);

    // create Necro player 
    const eid = createUnitEntity(this.world, "Necromancer", 300, 300);
    addComponent(this.world, Player, eid);
    addComponent(this.world, Inventory, eid);
    addComponent(this.world, Spell, eid);
    Spell.state[eid] = SpellState.Ready;

    // create Bones entity (for testing)
    createBonesEntity(this.world, 500, 500);

    // create Crown entities (for testing)
    for (let i = 0; i < 10; i++) {
      createUnitEntity(this.world, "Skeleton", Math.random() * 1024, Math.random() * 1024);
      /*
      createUnitEntity(this.world, Math.random() > 0.5 ? "Peasant" : "Skeleton", Math.random() * 1024, Math.random() * 1024);
      */
    }

    // create Item entity (for testing)
    createItemEntity(this.world, 20, 50, 1);

    this.physicsSystems = pipe(
      createInputHandlerSystem(),
      createMovementSystem(),
      createSpriteSystem(this),
      createFollowTargetSystem(),
      createCooldownSystem(),
      createCombatSystem(),
      createCollisionSystem(),
      createSpellcastingSystem(),
      createDrawSpellEffectSystem(this),
      createHealthBarSystem(this),
      timeSystem
    )

    this.reactiveSystems = pipe(
      createDeathSystem(),
      createHitSplatSystem(this),
      createHealthSystem(),
      createCursorTargetSystem(this.world),
      createItemEquipSystem(),
    )

    this.tickSystems = pipe(
      createTargetingSystem(),
    )

    /** REACTIVE SYSTEMS */
    this.reactiveSystems(this.world);

    /** TICK SYSTEMS */
    setInterval(() => {
      this.tickSystems(this.world);
    }, 200);
  }

  /** UPDATE LOOP SYSTEMS */
  update(time: number, delta: number): void {
    this.physicsSystems(this.world);
  }
}