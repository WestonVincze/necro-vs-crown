export const rollDice = (sides: number, bonus = 0) => {
  return Math.floor(Math.random() * (sides - 1)) + 1 + bonus;
};

export const rollToHit = (difficulty: number, bonus = 0) => {
  return rollDice(20, bonus) >= difficulty;
};

export const rollToCrit = (critChance: number) => {
  return rollDice(100) + critChance >= 100;
};

export const rollDamage = (
  maxHit: number,
  damageBonus: number,
  critChance?: number,
  critDamage: number = 1,
): number => {
  let damage = 0;
  let critMod = 1;

  damage = rollDice(maxHit, damageBonus);

  if (damage > 0 && critChance && rollToCrit(critChance)) {
    critMod = critDamage;
  }

  return (damage *= critMod);
};
