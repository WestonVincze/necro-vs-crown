import { AUTO, type Types, Game } from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene";

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#eee',
  parent: 'game_container',
  physics: { default: "arcade" },
  scene: [ MainMenuScene, GameScene ],
}

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
