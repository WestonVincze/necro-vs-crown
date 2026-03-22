import { Not, observe, onRemove, query } from "bitecs";
import type { Tilemaps } from "phaser";
import {
  Position,
  GridCell,
  Cursor,
  getGridCellFromPosition,
  getGridCellFromEid,
  getPositionFromEid,
  MAP_HEIGHT_TILES,
  MAP_WIDTH_TILES,
  type World,
} from "@necro-crown/shared";
import { GameState } from "../managers";

type Cell = {
  walkable: boolean;
  entities: number[];
};

const createGrid = (
  onCellFill: (x: number, y: number) => void,
  onCellEmpty: (x: number, y: number) => void,
) => {
  const cells: Cell[][] = [];

  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    let row: Cell[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      row.push({ walkable: true, entities: [] });
    }
    cells.push(row);
  }

  const getEntities = (x: number, y: number): number[] => {
    return cells[y][x].entities;
  };

  const addEntity = (x: number, y: number, eid: number) => {
    if (!cells[y][x]) {
      console.error(
        `Attempted to add entity to invalid grid cell (${x},${y}).`,
      );
      return;
    }
    cells[y][x].entities.push(eid);
    if (cells[y][x].entities.length > 0) onCellFill(x, y);
  };

  const removeEntity = (x: number, y: number, eid: number) => {
    if (!cells[y][x]) {
      console.error(
        `Attempted to remove entity to invalid grid cell (${x},${y}).`,
      );
      return;
    }
    const index = cells[y][x].entities.indexOf(eid);
    if (eid < 0) return;

    cells[y][x].entities.splice(index, 1);
    if (cells[y][x].entities.length === 0) onCellEmpty(x, y);
  };

  return {
    getEntities,
    addEntity,
    removeEntity,
  };
};

export const createGridSystem = (world: World, map: Tilemaps.Tilemap) => {
  const setTileAlpha = (x: number, y: number, alpha: number) => {
    if (!GameState.isDebugMode()) return;
    map.getTileAt(x, y, false, "Ground")?.setAlpha(alpha);
  };
  const grid = createGrid(
    (x: number, y: number) => setTileAlpha(x, y, 0.5),
    (x, y) => setTileAlpha(x, y, 1),
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
    map
      .getTilesWithin(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Ground",
      )
      ?.forEach((tile) => tile.setAlpha(1)),
  );

  const onExitQueue: number[] = [];
  observe(world, onRemove(Position, GridCell), (eid) => onExitQueue.push(eid));

  return (world: World) => {
    for (const eid of query(world, [Position, GridCell, Not(Cursor)])) {
      const currentGridCell = getGridCellFromEid(eid);
      if (currentGridCell.x === undefined || currentGridCell.y === undefined) {
        console.error(
          `Invalid GridCell values for ${eid}. Skipping GridSystem call.`,
        );
        continue;
      }
      const newPosition = getPositionFromEid(eid);
      const newGridCell = getGridCellFromPosition(newPosition);

      if (
        currentGridCell.x !== newGridCell.x ||
        currentGridCell.y !== newGridCell.y
      ) {
        GridCell.x[eid] = newGridCell.x;
        GridCell.y[eid] = newGridCell.y;
        grid.removeEntity(currentGridCell.x, currentGridCell.y, eid);
        grid.addEntity(newGridCell.x, newGridCell.y, eid);
      }
    }

    const exited = onExitQueue.splice(0);
    for (const eid of exited) {
      grid.removeEntity(GridCell.x[eid], GridCell.y[eid], eid);
    }
    return world;
  };
};
