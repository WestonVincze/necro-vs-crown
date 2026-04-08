import { u8, f32 } from "bitecs/serialization";
import { SpellName, SpellState } from "../types";

export const Spell = {
  name: [] as SpellName[],
  state: [] as SpellState[],
};

export const SpellEffect = {
  name: u8([]),
  size: f32([]),
  maxSize: f32([]),
  growthRate: f32([]),
};

export const ResolveSpell = {};
