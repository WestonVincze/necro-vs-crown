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

export const Collider = defineComponent({
  radius: Types.f32,
  layer: Types.ui32
});

/**
 * let's see if using a spherical collider is enough
 */
export const BoxCollider = defineComponent({
  xRange: Types.f32,
  yRange: Types.f32,
});
