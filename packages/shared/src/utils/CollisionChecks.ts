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
