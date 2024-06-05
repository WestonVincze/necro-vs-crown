import { addComponent, createWorld, hasComponent, type IWorld, type System } from "bitecs";
import { Scene, type Types } from "phaser";
import { filter, fromEvent } from "rxjs";
import { Crown, Faction, Necro, Player, Position, Sprite, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createFollowTargetSystem, createSpriteSystem, Target, Behavior, Behaviors, Item, createCollisionSystem, createItemEquipSystem, createItemEntity, Collider, CollisionLayers, Inventory } from "@necro-crown/shared";

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
  private movementSystem!: System;
  private spriteSystem!: System;
  private cursorTargetSystem!: System;
  private targetingSystem!: System;
  private inputHandlerSystem!: System;
  private followTargetSystem!: System;
  private itemEquipSystem!: System;
  private collisionSystem!: System;

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
    // cursorTargetSystem(this.world);

    /*
    fromEvent<KeyboardEvent>(document, 'keypress').pipe(
      filter(event => event.key === "f")
    ).subscribe(() => {
      console.log('pressed F')
      const behaviorQuery = defineQuery([Behavior, Necro])
      const entities = behaviorQuery(this.world);

      for (let i = 0; i < entities.length; i++) {
        Behavior.type[i] = Behavior.type[i] === Behaviors.AutoTarget ? Behaviors.FollowCursor : Behaviors.AutoTarget;
      }
    })
    */

    // create Necro player 
    const eid = createUnitEntity(this.world, "Necromancer");
    addComponent(this.world, Player, eid);
    addComponent(this.world, Collider, eid);
    addComponent(this.world, Inventory, eid);
    Collider.layer[eid] = CollisionLayers.ITEM;
    Collider.radius[eid] = 50;
    Position.x[eid] = 300;
    Position.y[eid] = 300;

    for (let i = 0; i < 10; i++) {
      const eid = createUnitEntity(this.world, Math.random() > 0.5 ? "Paladin" : "Skeleton");
      addComponent(this.world, Target, eid);
      Position.x[eid] = Math.random() * 1024;
      Position.y[eid] = Math.random() * 1024;
      /*
      Target.x[eid] = Math.random() * 600;
      Target.y[eid] = Math.random() * 1200;
      */
      if (hasComponent(this.world, Necro, eid)) {
        addComponent(this.world, Behavior, eid);
        Behavior.type[eid] = Behaviors.FollowCursor;
      } 
    }

    createItemEntity(this.world, 20, 50, 1);

    this.movementSystem = createMovementSystem();
    this.spriteSystem = createSpriteSystem(this);
    this.targetingSystem = createTargetingSystem();
    this.cursorTargetSystem = createCursorTargetSystem();
    this.inputHandlerSystem = createInputHandlerSystem(this.cursors);
    this.followTargetSystem = createFollowTargetSystem();
    this.collisionSystem = createCollisionSystem();
    this.itemEquipSystem = createItemEquipSystem();

    /** REACTIVE SYSTEMS */
    this.cursorTargetSystem(this.world);
    this.itemEquipSystem(this.world);

    /** TICK SYSTEMS */
    setInterval(() => {
      this.targetingSystem(this.world);
    }, 200);
  }

  /** UPDATE LOOP SYSTEMS */
  update(time: number, delta: number): void {
      this.inputHandlerSystem(this.world);
      this.followTargetSystem(this.world);
      this.movementSystem(this.world);
      this.spriteSystem(this.world);
      this.collisionSystem(this.world);
  }
}