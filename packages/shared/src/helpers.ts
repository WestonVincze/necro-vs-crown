import type { Unit, Vector2 } from "./types";

export const normalizeForce = ({ x , y }: Vector2) => {
  if (x === 0 && y === 0) return { x, y };

  const magnitude = Math.sqrt(x * x + y * y);

  if (magnitude > 0) {
    x /= magnitude;
    y /= magnitude;
  }

  return { x, y }
}

export const getURLParam = (param: string, defer: string) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  return params.get(param) || defer;
}

export const getRandomElement = <T>(array: T[]) => {
  if (array.length <= 0) return;

  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex]
}

export const getRandomElements = <T>(array: T[], count: number): T[] | boolean => {
  if (count > array.length) return false;

  const randomElements: T[] = [];

  while (randomElements.length < count) {
    const randomIndex = Math.floor(Math.random() * array.length);

    if (!randomElements.includes(array[randomIndex])) {
      randomElements.push(array[randomIndex]);
    }
  }

  return randomElements;
}

/*
export const getClosestUnit = ({ x, y }: { x: number, y: number }, units: Unit[]): Unit | null => {
  let closestDistanceSq = Infinity;
  let closestUnit: Unit | null = null;
  units.forEach(unit => {
    const distance = (x - unit.x) ** 2 + (y - unit.y) ** 2;
    if (distance < closestDistanceSq) {
      closestUnit = unit;
      closestDistanceSq = distance;
    }
  })

  return closestUnit;
}
*/

// const getFirstUnitWithin = (position, range) => {}

export const getRandomPosition = (minX: number, maxX: number, minY: number, maxY: number) => {
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;
  return { x, y }
}
