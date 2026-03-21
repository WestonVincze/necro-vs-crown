import { Not, observe, onRemove, query } from "bitecs";
import { Position, GridCell, Cursor } from "../../components";
import {
  getGridCellFromPosition,
  getGridCellFromEid,
  getPositionFromEid,
} from "../../utils";
import { MAP_HEIGHT_TILES, MAP_WIDTH_TILES } from "../../constants";
import { type World } from "../../types";

type Cell = {
  walkable: boolean;
  entities: number[];
};

const createGrid = () => {
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
  };

  return {
    getEntities,
    addEntity,
    removeEntity,
  };
};

export const createGridSystemNew = (world: World) => {
  const grid = createGrid();
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
