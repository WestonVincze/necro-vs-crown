import { addComponent, createWorld, hasComponent, pipe, type IWorld, type System } from "bitecs";
import { Scene, type Types } from "phaser";
import { Necro, Player, Position, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createFollowTargetSystem, createSpriteSystem, Target, Behavior, Behaviors, createCollisionSystem, createItemEquipSystem, createItemEntity, Collider, CollisionLayers, Inventory, createBonesEntity, createSpellcastingSystem, createDrawSpellEffectSystem, Spell, SpellState } from "@necro-crown/shared";

type Pipeline = (world: IWorld) => void;

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */

  private camera!: Phaser.Cameras.Scene2D.Camera;
  private cursors!: Types.Input.Keyboard.CursorKeys;

  // entity container (context)
  private world!: IWorld

  // system references
  private reactiveSystems!: Pipeline;
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  constructor() {
    super("SoloModeScene");
  }

  init() {
    // ensure input is enabled in config
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.camera = this.cameras.add();
  }

  create() {
    console.log("creating solo mode");
    this.world = createWorld();

    // create Necro player 
    const eid = createUnitEntity(this.world, "Necromancer");
    addComponent(this.world, Player, eid);
    addComponent(this.world, Collider, eid);
    addComponent(this.world, Inventory, eid);
    addComponent(this.world, Spell, eid);
    Collider.layer[eid] = CollisionLayers.ITEM;
    Collider.radius[eid] = 50;
    Position.x[eid] = 300;
    Position.y[eid] = 300;
    Spell.state[eid] = SpellState.Ready;

    // create Bones entity (for testing)
    createBonesEntity(this.world, 500, 500);

    // create Crown entities (for testing)
    for (let i = 0; i < 10; i++) {
      const eid = createUnitEntity(this.world, Math.random() > 0.5 ? "Paladin" : "Skeleton");
      addComponent(this.world, Target, eid);
      Position.x[eid] = Math.random() * 1024;
      Position.y[eid] = Math.random() * 1024;
      if (hasComponent(this.world, Necro, eid)) {
        addComponent(this.world, Behavior, eid);
        Behavior.type[eid] = Behaviors.FollowCursor;
      } 
    }

    // create Item entity (for testing)
    createItemEntity(this.world, 20, 50, 1);

    this.physicsSystems = pipe(
      createMovementSystem(),
      createSpriteSystem(this),
      createInputHandlerSystem(this.cursors),
      createFollowTargetSystem(),
      createCollisionSystem(),
      createSpellcastingSystem(),
      createDrawSpellEffectSystem(this),
    )

    this.reactiveSystems = pipe(
      createCursorTargetSystem(),
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