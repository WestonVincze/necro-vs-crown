export const CollisionLayers = {
  DEFAULT: 1 << 0,
  NECRO: 1 << 1,
  CROWN: 1 << 2,
  ITEM: 1 << 3,
  WALL: 1 << 4,
  BONES: 1 << 5,
  // Add more layers as needed
};

/**
 * for multiple ignoreLayers:
 * Collider.ignoreLayers[eid] = CollisionLayers.ITEMS | CollisionLayers.NECRO
 */
export const Collider = {
  radius: [] as number[],
  layer: [] as number[],
  collisionLayers: [] as number[],
  ignoreLayers: [] as number[],
  offsetX: [] as number[],
  offsetY: [] as number[],
};

/**
 * let's see if using a spherical collider is enough
 */
export const BoxCollider = {
  xRange: [] as number[],
  yRange: [] as number[],
};
