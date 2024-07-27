import { defineComponent, Types } from "bitecs";

export const Level = defineComponent({
  currentLevel: Types.ui8,
  currentExp: Types.f32,
  expToNextLevel: Types.f32,
});

export const Experience = defineComponent({ amount: Types.f32 });
