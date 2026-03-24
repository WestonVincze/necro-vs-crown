import { f32 } from "bitecs/serialization";
export const Health = {
  current: f32([]),
  max: f32([]),
};

export const Damage = {
  amount: [] as number[],
  isCrit: [] as number[],
};

export const Heal = {
  amount: [] as number[],
};

export const HitSplat = {
  amount: [] as number[],
  isCrit: [] as number[],
};
