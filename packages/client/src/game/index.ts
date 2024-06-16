import { AUTO, type Types, Game } from "phaser";
import { VersusModeScene, MainMenuScene, PreloaderScene, SoloModeScene } from "./scenes";
import { OldVersusModeScene } from "./scenes/OldVersusModeScene";

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  backgroundColor: '#e5e5e5',
  parent: 'game-container',
  fps: { smoothStep: true, limit: 60 },
  // physics: { default: "arcade" },
  // TODO: update versusModeScene (new VersusModeScene seems to break mouse inputs)
  scene: [ PreloaderScene, MainMenuScene, OldVersusModeScene, SoloModeScene ],
}

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
