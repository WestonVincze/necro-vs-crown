import { TextureNames } from "@necro-crown/shared/src/constants";
import { Scene } from "phaser";

export class PreloaderScene extends Scene {

  constructor() {
    super('Preloader');
  }

  preload() {
    // UNITS
    this.load.image('Necro', 'necro.png');
    this.load.image('Skeleton', 'skele.png');
    this.load.image('Peasant', 'peasant.png');
    this.load.image('Guard', 'guard.png');
    this.load.image('Paladin', 'paladin.png');
    this.load.image('Doppelsoldner', 'doppelsoldner.png');
    this.load.image('Archer', 'archer.png');

    // OBJECTS
    this.load.image('Bones', 'bones.png');

    // ITEMS
    this.load.image('GreatSword', 'great_sword.png');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
