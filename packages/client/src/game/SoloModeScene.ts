import { createWorld, defineQuery, hasComponent, type IWorld, type System } from "bitecs";
import { Scene } from "phaser";
import { filter, fromEvent } from "rxjs";
import { Crown, Faction, Necro, Position, Sprite, createCursorTargetSystem, createMovementSystem, createTargetingSystem, createUnitEntity } from "@necro-crown/shared";
import createSpriteSystem from "@necro-crown/shared/src/systems/SpriteSystem";

enum SpriteTexture {
  Necro,
  Skele,
  Guard,
  Paladin,
  Archer,
  Doppelsoldner,
}

const Textures = [
  "Necro",
  "Skele",
  "Guard",
  "Paladin",
  "Archer",
  "Doppelsoldner",
]

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */

  // entity container (context)
  private world!: IWorld

  // system references
  private movementSystem!: System;
  private spriteSystem!: System;
  private cursorTargetSystem!: System;
  private targetingSystem!: System;

  constructor() {
    super("SoloModeScene");
  }

  preload() {
    this.load.image('Necro', 'necro.png');
    this.load.image('Skele', 'skele.png');
    this.load.image('Peasant', 'peasant.png');
    this.load.image('Guard', 'guard.png');
    this.load.image('Paladin', 'paladin.png');
    this.load.image('Doppelsoldner', 'doppelsoldner.png');
    this.load.image('Archer', 'archer.png');
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

    for (let i = 0; i < 1000; i++) {
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

    this.movementSystem = createMovementSystem();
    this.spriteSystem = createSpriteSystem(this, Textures)
    this.targetingSystem = createTargetingSystem();
    this.cursorTargetSystem = createCursorTargetSystem();

    this.cursorTargetSystem(this.world);

    setInterval(() => {
      this.targetingSystem(this.world);
    }, 200);
  }

  update(time: number, delta: number): void {
    this.movementSystem(this.world);
    this.spriteSystem(this.world);
  }
}