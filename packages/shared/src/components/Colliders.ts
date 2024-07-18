import { Types, defineComponent } from "bitecs";

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
export const Collider = defineComponent({
  radius: Types.f32,
  layer: Types.ui32,
  collisionLayers: Types.ui32,
  ignoreLayers: Types.ui32,
  offsetX: Types.f32,
  offsetY: Types.f32,
});

/**
 * let's see if using a spherical collider is enough
 */
export const BoxCollider = defineComponent({
  xRange: Types.f32,
  yRange: Types.f32,
});
