import { Scene } from "phaser";

export class PreloaderScene extends Scene {

  constructor() {
    super('Preloader');
  }

  preload() {
    // Sprites
    this.load.image('Necro', 'necro.png');
    this.load.image('Skeleton', 'skele.png');
    this.load.image('Peasant', 'peasant.png');
    this.load.image('Guard', 'guard.png');
    this.load.image('Paladin', 'paladin.png');
    this.load.image('Doppelsoldner', 'doppelsoldner.png');
    this.load.image('Archer', 'archer.png');
  }

  create() {
    this.scene.start('MainMenu');
  }
}