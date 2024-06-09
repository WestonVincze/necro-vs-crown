import { Vector2 } from "../types";

export const isIntersectingRect = (a, b, range = 0) => {
  if (!a.isSprite || !b.isSprite) {
    console.log('WARNING')
    return false;
  }
  const aBox = a.getBounds();
  const bBox = b.getBounds();

  return aBox.x + aBox.width  / 2 > bBox.x - bBox.width  / 2 - range &&
         aBox.x - aBox.width  / 2 < bBox.x + bBox.width  / 2 + range &&
         aBox.y + aBox.height / 2 > bBox.y - bBox.height / 2 - range &&
         aBox.y - aBox.height / 2 < bBox.y + bBox.height / 2 + range;
}

/**
 * Checks if the distance between vectors is less than the distance
 */
export const checkIfWithinDistance = (a: Vector2, b: Vector2, distance: number) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSquared = dx ** 2 + dy ** 2;

  return distanceSquared <= distance ** 2;
}
