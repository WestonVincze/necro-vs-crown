import { AUTO, type Types, Game } from "phaser";
import {
  VersusModeScene,
  MainMenuScene,
  PreloaderScene,
  SoloModeScene,
  GameOverScene,
} from "./scenes";
import { PlaygroundScene } from "./scenes/PlaygroundScene";

const soloConfig: Types.Core.GameConfig = {
  type: AUTO,
  scale: { mode: Phaser.Scale.RESIZE },
  parent: "game-container",
  fps: { smoothStep: true, limit: 60 },
  roundPixels: true,
  render: {
    pixelArt: true,
  },
  scene: [PreloaderScene, MainMenuScene, SoloModeScene, GameOverScene],
};

const versusConfig: Types.Core.GameConfig = {
  type: AUTO,
  scale: { mode: Phaser.Scale.RESIZE },
  parent: "game-container",
  roundPixels: true,
  render: {
    pixelArt: true,
  },
  scene: [PreloaderScene, MainMenuScene, VersusModeScene, GameOverScene],
};

const playgroundConfig: Types.Core.GameConfig = {
  type: AUTO,
  scale: { mode: Phaser.Scale.RESIZE },
  parent: "game-container",
  fps: { smoothStep: true, limit: 60 },
  roundPixels: true,
  render: {
    pixelArt: true,
  },
  scene: [PreloaderScene, PlaygroundScene],
};

export function createPhaserGame(mode?: "solo" | "versus" | "playground") {
  let config = {};
  switch (mode) {
    case "solo":
      config = soloConfig;
      break;
    case "versus":
      config = versusConfig;
      break;
    case "playground":
      config = playgroundConfig;
      break;
  }

  const game = new Game({ ...config });

  // game.registry.set("faction", faction);

  // only set room if versus mode
  // if (room) game.registry.set("room", room);

  return game;
}
