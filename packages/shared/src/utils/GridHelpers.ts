import { type Vector2 } from "$types";
import { GridCell, Position } from "$components";
import { MAP_HEIGHT_PIXELS, MAP_WIDTH_PIXELS, TILE_SIZE } from "$constants";

/**
 * Returns the position vector (in pixels) based on the provided GridCell coordinates
 * The returned position represents the center of a GridCell
 */
export const getPositionFromGridCell = (gridCell: Vector2) => {
  return {
    x: gridCell.x * TILE_SIZE - MAP_WIDTH_PIXELS / 2 + TILE_SIZE / 2,
    y: gridCell.y * TILE_SIZE - MAP_HEIGHT_PIXELS / 2 + TILE_SIZE / 2,
  };
};

/**
 * Returns the GridCell coordinates based on a given position vector (in pixels)
 */
export const getGridCellFromPosition = (position: Vector2) => {
  return {
    x: Math.floor((position.x + MAP_WIDTH_PIXELS / 2) / TILE_SIZE),
    y: Math.floor((position.y + MAP_HEIGHT_PIXELS / 2) / TILE_SIZE),
  };
};

export const getPositionFromEid = (eid: number): Vector2 => {
  return { x: Position.x[eid], y: Position.y[eid] };
};

export const getGridCellFromEid = (eid: number) => {
  return { x: GridCell.x[eid], y: GridCell.y[eid] };
};

/**
 * Compares the x and y values of a and b
 * @returns true if x and y values are identical
 */
export const areVectorsIdentical = (a: Vector2, b: Vector2): boolean => {
  return a.x === b.x && a.y === b.y;
};

/**
 * Compares the related GridCell coordinates of two vector positions
 * @returns true if the GridCell coordinates are identical for position's a and b
 */
export const arePositionsInSameGridCell = (a: Vector2, b: Vector2): boolean => {
  const gridCellA = getGridCellFromPosition(a);
  const gridCellB = getGridCellFromPosition(b);
  return areVectorsIdentical(gridCellA, gridCellB);
};
