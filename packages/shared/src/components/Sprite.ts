import { Types, defineComponent } from "bitecs";

export const Sprite = defineComponent({
  texture: Types.ui8,
  width: Types.f32,
  height: Types.f32,
});
