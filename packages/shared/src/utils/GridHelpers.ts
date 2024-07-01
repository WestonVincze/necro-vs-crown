import { type Vector2 } from "../types";
import { GridCell, Position } from "../components";
import { MAP_HEIGHT_PIXELS, MAP_WIDTH_PIXELS, TILE_SIZE } from "../constants";

export const getPositionFromGridCell = (gridCell: Vector2) => {
  return ({
    x: gridCell.x * TILE_SIZE - (MAP_WIDTH_PIXELS / 2) - (TILE_SIZE / 2),
    y: gridCell.y * TILE_SIZE - (MAP_HEIGHT_PIXELS / 2) - (TILE_SIZE / 2),
  })
}

export const getGridCellFromPosition = (position: Vector2) => {
  return ({
    x: Math.floor((position.x + (MAP_WIDTH_PIXELS / 2)) / TILE_SIZE),
    y: Math.floor((position.y + (MAP_HEIGHT_PIXELS / 2)) / TILE_SIZE),
  })
}

export const getPositionFromEid = (eid: number) => {
  return { x: Position.x[eid], y: Position.y[eid] };
}

export const getGridCellFromEid = (eid: number) => {
  return { x: GridCell.x[eid], y: GridCell.y[eid] };
}
