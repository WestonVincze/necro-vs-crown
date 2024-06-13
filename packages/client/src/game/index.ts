import { AUTO, type Types, Game } from "phaser";
import { VersusModeScene, MainMenuScene, PreloaderScene, SoloModeScene } from "./scenes";

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#e5e5e5',
  parent: 'game-container',
  fps: { smoothStep: true, limit: 60 },
  physics: { default: "arcade" },
  scene: [ PreloaderScene, MainMenuScene, VersusModeScene, SoloModeScene ],
}

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
