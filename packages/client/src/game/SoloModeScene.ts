import { createWorld, defineQuery, type IWorld, type System } from "bitecs";
import { Scene } from "phaser";
import { CursorTargetSt}
import { fromEvent } from "rxjs";
import { Behavior } from "@necro-crown/shared";

export class SoloModeScene extends Scene {
  /**
   * camera
   * background
   */

  // entity container (context)
  private world!: IWorld

  // system references
  private movementSystem!: System;

  constructor() {
    super("SoloModeScene");
  }

  preload() {
    this.load.image('necro', 'necro.png');
    this.load.image('skele', 'skele.png');
    this.load.image('peasant', 'peasant.png');
    this.load.image('guard', 'guard.png');
    this.load.image('paladin', 'paladin.png');
    this.load.image('doppelsoldner', 'doppelsoldner.png');
    this.load.image('archer', 'archer.png');
  }

  create() {
    this.world = createWorld();

    // cursorTargetSystem(this.world);

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

    for (let i = 0; i < 1000; i++) {
      const eid = createEntity(this.world);
      Position.x[eid] = Math.random() * 1024;
      Position.y[eid] = Math.random() * 1024;
      /*
      Target.x[eid] = Math.random() * 600;
      Target.y[eid] = Math.random() * 1200;
      */
      if (hasComponent(this.world, Necro, eid)) {
        addComponent(this.world, Behavior, eid);
        Behavior.type[eid] = Behaviors.FollowCursor;
        Sprite.texture[eid] = Textures.Skele;
      } 
      if (hasComponent(this.world, Crown, eid)) Sprite.texture[eid] = Textures.Guard;
    }

    this.movementSystem = createMovementSystem();
    this.spriteSystem = createSpriteSystem(this, ['Skele', 'Guard'])
    this.targetingSystem = createTargetingSystem();

    setInterval(() => {
      this.targetingSystem(this.world);
    }, 200);
  }


  }

  update(time: number, delta: number): void {
    
  }

}