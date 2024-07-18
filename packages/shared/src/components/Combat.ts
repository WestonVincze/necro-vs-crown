import { Types, defineComponent } from "bitecs";

export const RangedUnit = defineComponent({
  projectileType: Types.ui8,
  spawnPositionOffsetX: Types.f32,
  spawnPositionOffsetY: Types.f32,
});

export const Projectile = defineComponent({
  attackBonus: Types.f32,
  damage: Types.f32,
});
