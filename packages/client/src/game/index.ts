import { AUTO, type Types, Game } from "phaser";
import { VersusModeScene, MainMenuScene, PreloaderScene, SoloModeScene } from "./scenes";
import { OldVersusModeScene } from "./scenes/OldVersusModeScene";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@necro-crown/shared/src/constants";

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  backgroundColor: '#e5e5e5',
  parent: 'game-container',
  fps: { smoothStep: true, limit: 60 },
  // physics: { default: "arcade" },
  // TODO: update versusModeScene (new VersusModeScene seems to break mouse inputs)
  scene: [
    PreloaderScene,
    MainMenuScene,
    OldVersusModeScene,
    SoloModeScene
  ],
}

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
}
