import { MAP_HEIGHT_PIXELS, MAP_WIDTH_PIXELS, SCREEN_WIDTH } from "$constants";
import type { Vector2 } from "$types";

export const getRandomElement = <T>(array: T[]) => {
  if (array.length === 0) return;
  if (array.length === 1) array[0];

  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
};

export const getRandomElements = <T>(array: T[], count: number): T[] => {
  if (count > array.length) return array;

  const randomElements: T[] = [];

  while (randomElements.length < count) {
    const randomIndex = Math.floor(Math.random() * array.length);

    if (!randomElements.includes(array[randomIndex])) {
      randomElements.push(array[randomIndex]);
    }
  }

  return randomElements;
};

export const normalizeForce = ({ x, y }: Vector2) => {
  if (x === 0 && y === 0) return { x, y };

  const magnitude = Math.sqrt(x * x + y * y);

  if (magnitude > 0) {
    x /= magnitude;
    y /= magnitude;
  }

  return { x, y };
};

/**
 * @param position the original position
 * @param bounds optional additional bounds for the position to factor its height and width
 * @returns a Vector2 with x and y values within the bounds of the screen
 */
export const clampToScreenSize = (
  position: Vector2,
  bounds: { width: number; height: number } = { width: 0, height: 0 },
): Vector2 => {
  const minX = -MAP_WIDTH_PIXELS / 2 + bounds.width / 2;
  const maxX = MAP_WIDTH_PIXELS / 2 - bounds.width / 2;
  const minY = -MAP_HEIGHT_PIXELS / 2 + bounds.height / 2;
  const maxY = MAP_HEIGHT_PIXELS / 2 - bounds.height / 4;

  return {
    x: Math.max(minX, Math.min(position.x, maxX)),
    y: Math.max(minY, Math.min(position.y, maxY)),
  };
};
