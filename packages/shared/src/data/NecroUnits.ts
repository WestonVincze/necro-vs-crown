import { type UnitData } from "../types"

export const NecroUnits: Record<string, UnitData> = {
  skeleton: {
    name: "skeleton",
    type: "minion",
    url: "skele.png",
    width: 40,
    height: 60,
    stats: {
      maxHP: 8,
      armor: 8,
      maxHit: 2,
      attackBonus: 4,
      attackSpeed: 5,
      attackRange: 20,
      damageBonus: 0,
      moveSpeed: 0.2,
      maxSpeed: 1.5,
      critChance: 5,
      critDamage: 1.5,
    },
  }
}

export const PlayerUnits: Record<string, UnitData> = {
  default: {
    name: "default",
    type: "player",
    url: "necro.png",
    width: 50,
    height: 114,
    stats: {
      maxHP: 20,
      armor: 10,
      moveSpeed: 0.2,
      maxSpeed: 2,
      HPregeneration: 0.05,
      castingSpeed: 0.5,
      spellRadius: 50,
    }
  }
}
