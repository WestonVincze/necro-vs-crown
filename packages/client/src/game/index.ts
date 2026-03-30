import { AUTO, type Types, Game } from "phaser";
import {
  VersusModeScene,
  MainMenuScene,
  PreloaderScene,
  SoloModeScene,
  GameOverScene,
} from "./scenes";

const soloConfig: Types.Core.GameConfig = {
  type: AUTO,
  scale: { mode: Phaser.Scale.RESIZE },
  backgroundColor: "#111",
  parent: "game-container",
  fps: { smoothStep: true, limit: 60 },
  physics: { default: "arcade" },
  scene: [PreloaderScene, MainMenuScene, SoloModeScene, GameOverScene],
};

const versusConfig: Types.Core.GameConfig = {
  type: AUTO,
  scale: { mode: Phaser.Scale.RESIZE },
  backgroundColor: "#111",
  parent: "game-container",
  scene: [PreloaderScene, MainMenuScene, VersusModeScene, GameOverScene],
};

export function createPhaserGame(mode?: "solo" | "versus") {
  let config = {};
  if (mode === "solo") {
    config = soloConfig;
  } else if (mode === "versus") {
    config = versusConfig;
  }
  const game = new Game({ ...config });

  // game.registry.set("faction", faction);

  // only set room if versus mode
  // if (room) game.registry.set("room", room);

  return game;
}
