import { AUTO, type Types, Game } from "phaser";
import {
  VersusModeScene,
  MainMenuScene,
  PreloaderScene,
  SoloModeScene,
  GameOverScene,
} from "./scenes";

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  scale: { mode: Phaser.Scale.RESIZE },
  backgroundColor: "#252525",
  parent: "game-container",
  fps: { smoothStep: true, limit: 60 },
  physics: { default: "arcade" },
  scene: [
    PreloaderScene,
    MainMenuScene,
    VersusModeScene,
    SoloModeScene,
    GameOverScene,
  ],
};

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};
