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
  // faction? reference to owner?
  anchor: [] as number[],
  duration: [] as number[],
  name: [] as number[],
  size: [] as number[],
  maxSize: [] as number[],
  growthRate: [] as number[],
};

export const ResolveSpell = {};
