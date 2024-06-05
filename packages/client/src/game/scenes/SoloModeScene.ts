import { addComponent, createWorld, hasComponent, type IWorld, type System } from "bitecs";
import { Scene, type Types } from "phaser";
import { filter, fromEvent } from "rxjs";
import { Crown, Faction, Necro, Player, Position, Sprite, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createFollowTargetSystem, Target, Behavior, Behaviors } from "@necro-crown/shared";
import createSpriteSystem from "@necro-crown/shared/src/systems/SpriteSystem";

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

    this.movementSystem = createMovementSystem();
    this.spriteSystem = createSpriteSystem(this);
    this.targetingSystem = createTargetingSystem();
    this.cursorTargetSystem = createCursorTargetSystem();
    this.inputHandlerSystem = createInputHandlerSystem(this.cursors);
    this.followTargetSystem = createFollowTargetSystem();

    this.cursorTargetSystem(this.world);

    setInterval(() => {
      this.targetingSystem(this.world);
    }, 200);
  }

  update(time: number, delta: number): void {
      this.inputHandlerSystem(this.world);
      this.followTargetSystem(this.world);
      this.movementSystem(this.world);
      this.spriteSystem(this.world);
  }
}