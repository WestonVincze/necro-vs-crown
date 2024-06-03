import { AUTO, type Types, Game } from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { SoloModeScene } from "./SoloModeScene";

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#eee',
  parent: 'game-container',
  physics: { default: "arcade" },
  scene: [ MainMenuScene, GameScene, SoloModeScene ],
}

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
