import { Scene } from "phaser";

export class MainMenuScene extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    console.log("MAIN MENU TIME");

    this.input.once('pointerdown', () => {
      this.scene.start("GameScene")
    })
  }
}