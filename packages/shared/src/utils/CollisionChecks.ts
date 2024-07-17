import { Position } from "../components";
import { type Vector2 } from "../types";

/*
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
*/
export const getDistance = (a: Vector2, b: Vector2) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx ** 2 + dy ** 2);
};

export const getDistanceSquared = (a: Vector2, b: Vector2) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx ** 2 + dy ** 2;
};

/**
 * Checks if the distance between vectors is less than the distance
 * Utilizes a squared distance check
 */
export const checkIfWithinDistance = (
  a: Vector2,
  b: Vector2,
  distance: number,
) => {
  return getDistanceSquared(a, b) <= distance ** 2;
};
