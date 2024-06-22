import { defineQuery, defineSystem } from "bitecs";
import { Position, GridCell } from "../components";
import type { Tilemaps } from "phaser";

type Cell = {
  walkable: boolean;
  entities: number[];
}

const createGrid = (onCellFill: (x: number, y: number) => void, onCellEmpty: (x: number, y: number) => void) => {
  const cells: Cell[][] = [];

  for (let y = 0; y < 36; y++) {
    let row: Cell[] = [];
    for (let x = 0; x < 48; x++) {
      row.push({ walkable: true, entities: [] });
    }
    cells.push(row);
  }

  const getEntities = (x: number, y: number): number[] => {
    return cells[y][x].entities;
  }

  const addEntity = (x: number, y: number, eid: number) => {
    cells[y][x].entities.push(eid);
    if (cells[y][x].entities.length > 0) onCellFill(x, y);
  }

  const removeEntity = (x: number, y: number, eid: number) => {
    const index = cells[y][x].entities.indexOf(eid);
    if (eid < 0) return;

    cells[y][x].entities.splice(index, 1);
    if (cells[y][x].entities.length === 0) onCellEmpty(x, y);
  }

  return {
    getEntities,
    addEntity,
    removeEntity
  }
}

export const createGridSystem = (map: Tilemaps.Tilemap) => {
  const setTileAlpha = (x: number, y: number, alpha: number) => {
    map.getTileAt(x, y, false, "Ground")?.setAlpha(alpha);
  }
  const gridQuery = defineQuery([Position, GridCell]);
  const grid = createGrid(
    (x: number, y: number) => setTileAlpha(x, y, 0.5),
    (x, y) => setTileAlpha(x, y, 1)
  );

  return defineSystem(world => {
    for (const eid of (gridQuery(world))) {
      const currentGridCellX = GridCell.x[eid];
      const currentGridCellY = GridCell.y[eid];
      const newGridCellX = Math.floor((Position.x[eid] + 1536) / 64);
      const newGridCellY = Math.floor((Position.y[eid] + 1152) / 64);

      if (currentGridCellX !== newGridCellX || currentGridCellY !== newGridCellY) {
        GridCell.x[eid] = newGridCellX;
        GridCell.y[eid] = newGridCellY;
        grid.removeEntity(currentGridCellX, currentGridCellY, eid);
        grid.addEntity(newGridCellX, newGridCellY, eid);
      }
    }
    return world;
  })
}
