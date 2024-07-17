import { Types, defineComponent } from "bitecs";

export const RangedUnit = defineComponent({
  projectileType: Types.ui8
});

export const Projectile = defineComponent({
  attackBonus: Types.f32,
  damage: Types.f32,
})
