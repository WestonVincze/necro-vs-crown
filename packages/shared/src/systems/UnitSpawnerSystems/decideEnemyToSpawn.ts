import { UnitName } from "$types";

export const decideEnemyToSpawn = (scale: number): UnitName => {
  const randomRoll = Math.random();

  // only peasants
  if (scale < 1.3) return UnitName.Peasant;

  // 50% peasants, 50% guards
  if (scale < 1.8 && randomRoll > 0.5) return UnitName.Peasant;

  // 30% paladin
  if (scale > 2 && randomRoll <= 0.3) return UnitName.Paladin;

  // 10% - 30% archer
  if (scale > 2.3 && randomRoll >= Math.max(0.7, 0.9 - (scale - 2.3) / 10))
    return UnitName.Archer;

  // 10% - 30% doppelsolder
  if (scale > 2.6 && randomRoll >= Math.max(0.4, 0.8 - (scale - 2.6) / 5))
    return UnitName.Doppelsoldner;

  // 70% - 10% guard
  return UnitName.Guard;
};
