import { Scene } from "phaser";
import { MainMenu } from "../views/MainMenu";

export class MainMenuScene extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    MainMenu({ startGame: (player: string) => this.scene.start("GameScene", { player }) });
  }
}
