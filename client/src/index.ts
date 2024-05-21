import { AUTO, Types, Game } from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById('svelte') as HTMLElement,
  props: {
    score: 0
  }
})


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

// instantiate game
const game = new Game(config);

/*
export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
*/
