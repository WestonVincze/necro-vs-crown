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
  backgroundColor: "transparent",
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

export function createPhaserGame(parent: HTMLDivElement) {
  const game = new Game({ ...config, parent });

  // game.registry.set("faction", faction);

  // only set room if versus mode
  // if (room) game.registry.set("room", room);

  return game;
}
