import { addComponent, createWorld, hasComponent, type IWorld, type System } from "bitecs";
import { Scene, type Types } from "phaser";
import { filter, fromEvent } from "rxjs";
import { Input, Crown, Faction, Necro, Player, Position, Sprite, createCursorTargetSystem, createInputHandlerSystem, createMovementSystem, createTargetingSystem, createUnitEntity, createControlledMovementSystem, MoveSpeed, MaxMoveSpeed } from "@necro-crown/shared";
import createSpriteSystem from "@necro-crown/shared/src/systems/SpriteSystem";

enum SpriteTexture {
  Necro,
  Skele,
  Guard,
  Paladin,
  Archer,
  Doppelsoldner,
}

const Textures = Object.keys(SpriteTexture)
  .filter((key) => isNaN(Number(key)))
  .map((key) => key as keyof typeof SpriteTexture);

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */

  private cursors!: Types.Input.Keyboard.CursorKeys;

  // entity container (context)
  private world!: IWorld

  // system references
  private controlledMovementSystem!: System;
  private movementSystem!: System;
  private spriteSystem!: System;
  private cursorTargetSystem!: System;
  private targetingSystem!: System;
  private inputHandlerSystem!: System;

  constructor() {
    super("SoloModeScene");
  }

  preload() {
  }

  init() {
    // ensure input is enabled in config
    this.cursors = this.input.keyboard!.createCursorKeys();
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
    const eid = createUnitEntity(this.world, Faction.Necro);
    addComponent(this.world, Input, eid);
    addComponent(this.world, Player, eid);
    Sprite.texture[eid] = SpriteTexture.Necro;
    Position.x[eid] = 300;
    Position.y[eid] = 300;
    MoveSpeed.current[eid] = 1;
    MaxMoveSpeed.current[eid] = 2;

    for (let i = 0; i < 0; i++) {
      const eid = createUnitEntity(this.world, Math.random() > 0.5 ? Faction.Crown : Faction.Necro);
      Position.x[eid] = Math.random() * 1024;
      Position.y[eid] = Math.random() * 1024;
      /*
      Target.x[eid] = Math.random() * 600;
      Target.y[eid] = Math.random() * 1200;
      */
      if (hasComponent(this.world, Necro, eid)) {
        // addComponent(this.world, Behavior, eid);
        // Behavior.type[eid] = Behaviors.FollowCursor;
        Sprite.texture[eid] = SpriteTexture.Skele;
      } 
      if (hasComponent(this.world, Crown, eid)) Sprite.texture[eid] = SpriteTexture.Guard;
    }

    this.controlledMovementSystem = createControlledMovementSystem();
    this.movementSystem = createMovementSystem();
    this.spriteSystem = createSpriteSystem(this, Textures)
    this.targetingSystem = createTargetingSystem();
    this.cursorTargetSystem = createCursorTargetSystem();
    this.inputHandlerSystem = createInputHandlerSystem(this.cursors);

    this.cursorTargetSystem(this.world);

    setInterval(() => {
      this.targetingSystem(this.world);
    }, 200);
  }

  update(time: number, delta: number): void {
    this.inputHandlerSystem(this.world);
    this.controlledMovementSystem(this.world);
    this.movementSystem(this.world);
    this.spriteSystem(this.world);
  }
}