export enum Spells {
  Summon,
  HolyNova,
}

//type SpellName = keyof typeof Spells;

export const SpellNames = Object.keys(Spells)
  .filter((key) => isNaN(Number(key)))
  .map((key) => key as keyof typeof Spells);

export enum SpellType {
  Radial,
}

/**
 * SPELL TYPES?
 * - Radial AOE
 * - Projectile
 */
