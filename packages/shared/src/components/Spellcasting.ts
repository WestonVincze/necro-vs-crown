import { u8, f32 } from "bitecs/serialization";
export enum SpellState {
  Ready,
  Casting,
}

export enum SpellName {
  Summon = 1,
  HolyNova,
}

export const Spell = {
  name: [] as number[],
  type: [] as number[],
  state: [] as number[],
};

export const SpellEffect = {
  name: u8([]),
  size: f32([]),
  maxSize: f32([]),
  growthRate: f32([]),
};

export const ResolveSpell = {};
