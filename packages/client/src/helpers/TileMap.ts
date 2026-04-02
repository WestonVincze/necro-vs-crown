import {
  MAP_X_MAX,
  MAP_X_MIN,
  MAP_Y_MAX,
  MAP_Y_MIN,
} from "@necro-crown/shared";
import type { Scene } from "phaser";

export const buildTileMap = (scene: Scene) => {
  const camera = scene.cameras.main;
  camera.setBounds(MAP_X_MIN, MAP_Y_MIN, MAP_X_MAX, MAP_Y_MAX);
  camera.preRender();
  camera.setScroll(0 - camera.worldView.width / 2, MAP_Y_MIN + 200);
  const map = scene.make.tilemap({ key: "map" });
  map.addTilesetImage("doodle", "doodle");
  map.createLayer("BG", "doodle", MAP_X_MIN, MAP_Y_MIN);
  map.createLayer("Foreground", "doodle", MAP_X_MIN, MAP_Y_MIN);
  map.createLayer("Decor", "doodle", MAP_X_MIN, MAP_Y_MIN);
  map.createLayer("Trees", "doodle", MAP_X_MIN, MAP_Y_MIN);
  map.createLayer("Graves", "doodle", MAP_X_MIN, MAP_Y_MIN);
  map.createLayer("Walls", "doodle", MAP_X_MIN, MAP_Y_MIN);

  let gridData = [];
  for (let y = 0; y < map.height; y++) {
    let row = [];
    for (let x = 0; x < map.width; x++) {
      row.push(
        map.hasTileAt(x, y, "Walls") || map.hasTileAt(x, y, "Trees") ? 1 : 0,
      );
    }
    gridData.push(row);
  }

  return { gridData, map };
};
