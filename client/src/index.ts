import { AUTO, Types, Game } from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene";


// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#eee',
  parent: 'necro',
  physics: { default: "arcade" },
  scene: [ MainMenuScene, GameScene ],
}

// instantiate game
const game = new Game(config);

/*
export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
*/
