import { defineQuery, exitQuery } from "bitecs";
import { Position, GridCell } from "../components";
import type { Tilemaps } from "phaser";
import { getGridCellFromPosition, getGridCellFromEid, getPositionFromEid } from "../utils";
import { GameState } from "../managers";
import { MAP_HEIGHT_TILES, MAP_WIDTH_TILES } from "../constants";

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
    if (!GameState.isDebugMode()) return;
    map.getTileAt(x, y, false, "Ground")?.setAlpha(alpha);
  }
  const gridQuery = defineQuery([Position, GridCell]);
  const grid = createGrid(
    (x: number, y: number) => setTileAlpha(x, y, 0.5),
    (x, y) => setTileAlpha(x, y, 1)
  );

  GameState.onDebugEnabled$.subscribe(() => {
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
        if (grid.getEntities(x, y).length > 0) {
          setTileAlpha(x, y, 0.5);
        }
      }
    }
  });

  GameState.onDebugDisabled$.subscribe(() =>
    map.getTilesWithin(undefined, undefined, undefined, undefined, undefined, "Ground")?.forEach(tile => tile.setAlpha(1))
  );

  return (world: World) => {
    for (const eid of (gridQuery(world))) {
      const currentGridCell = getGridCellFromEid(eid);
      const newPosition = getPositionFromEid(eid);
      const newGridCell = getGridCellFromPosition(newPosition);

      if (currentGridCell.x !== newGridCell.x || currentGridCell.y !== newGridCell.y) {
        GridCell.x[eid] = newGridCell.x;
        GridCell.y[eid] = newGridCell.y;
        grid.removeEntity(currentGridCell.x, currentGridCell.y, eid);
        grid.addEntity(newGridCell.x, newGridCell.y, eid);
      }
    }

    for (const eid of (exitQuery(gridQuery)(world))) {
      grid.removeEntity(GridCell.x[eid], GridCell.y[eid], eid);
    }
    return world;
  }
}
