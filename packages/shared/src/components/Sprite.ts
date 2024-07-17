import { Types, defineComponent } from "bitecs";

export enum SpriteType {
  Sprite,
  Rope,
}

export const Sprite = defineComponent({
  type: Types.ui8,
  texture: Types.ui8,
  width: Types.f32,
  height: Types.f32,
});
