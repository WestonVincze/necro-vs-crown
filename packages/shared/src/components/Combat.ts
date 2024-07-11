import { Types, defineComponent } from "bitecs";

export enum ProjectTypes {
  Arrow
}

export const RangedUnit = defineComponent({
  projectileType: Types.ui8
});

export const Projectile = defineComponent({
  speed: Types.f32,
})
