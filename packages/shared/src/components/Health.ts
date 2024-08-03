import { Types, defineComponent } from "bitecs";

export const Health = defineComponent({
  current: Types.f32,
  max: Types.f32,
});

export const Damage = defineComponent({
  amount: Types.f32,
  isCrit: Types.ui8,
});

export const Heal = defineComponent({
  amount: Types.f32,
});
