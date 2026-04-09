import { Faction } from "types";

export const RangedUnit = {
  projectileType: [] as number[],
  spawnPositionOffsetX: [] as number[],
  spawnPositionOffsetY: [] as number[],
};

export const Projectile = {
  attackBonus: [] as number[],
  damage: [] as number[],
};

/** EFFECTS */

/** when damage is dealt, heal a percentage back (0-1) */
export const LifeSteal = { amount: [] as number[] };

/** when damage is dealt, apply knockback */
export const Knockback = { force: [] as number[] };

export const Stunned = { duration: [] as number[] };

/** on death, send out AoE explosion */
export const ExplodeOnDeath = {
  faction: [] as Faction[],
  damage: [] as number[],
  radius: [] as number[],
};
