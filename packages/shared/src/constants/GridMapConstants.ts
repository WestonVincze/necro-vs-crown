export const SCREEN_WIDTH = 1024;
export const SCREEN_HEIGHT = 768;

export const TILE_SIZE = 64;

export const MAP_WIDTH_PIXELS = SCREEN_WIDTH * 3;
export const MAP_HEIGHT_PIXELS = SCREEN_HEIGHT * 3;

export const MAP_WIDTH_TILES = MAP_WIDTH_PIXELS / TILE_SIZE;
export const MAP_HEIGHT_TILES = MAP_HEIGHT_PIXELS / TILE_SIZE;

export const MAP_X_MIN = MAP_WIDTH_PIXELS / -2;
export const MAP_X_MAX = MAP_WIDTH_PIXELS;
export const MAP_Y_MIN = MAP_HEIGHT_PIXELS / -2;
export const MAP_Y_MAX = MAP_HEIGHT_PIXELS;
