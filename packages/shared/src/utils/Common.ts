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
