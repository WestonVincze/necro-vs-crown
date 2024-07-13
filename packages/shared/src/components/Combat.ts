import { Types, defineComponent } from "bitecs";

export const RangedUnit = defineComponent({
  projectileType: Types.ui8
});

export const Projectile = defineComponent({
  speed: Types.f32,
  lifetime: Types.f32,
})
