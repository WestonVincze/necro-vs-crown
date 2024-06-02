import { type UnitData, CrownUnit, UnitType } from "../types"

export const CrownUnits: Record<CrownUnit, UnitData> = {
  peasant: {
    name: "peasant",
    type: UnitType.Crown,
    url: "peasant.png",
    width: 45,
    height: 110,
    expReward: 8,
    stats: {
      maxHP: 5,
      armor: 8,
      attackBonus: 2,
      attackSpeed: 8,
      attackRange: 20,
      maxHit: 1,
      damageBonus: 0,
      moveSpeed: 0.35,
      maxSpeed: 1.2,
    },
    dropTable: {
      always: ["bones"]
    }
  },
  guard: {
    name: "guard",
    type: UnitType.Crown,
    url: "guard.png",
    width: 50,
    height: 110,
    expReward: 12,
    stats: {
      maxHP: 15,
      armor: 12,
      attackBonus: 6,
      attackSpeed: 4,
      attackRange: 20,
      maxHit: 4,
      damageBonus: 0,
      moveSpeed: 0.3,
      maxSpeed: 1,
      critChance: 5,
      critDamage: 2,
    },
    dropTable: {
      always: ["bones"],
      common: ["med_helm"]
    }
  },
  paladin: {
    name: "paladin",
    type: UnitType.Crown,
    url: "paladin.png",
    width: 60,
    height: 110,
    expReward: 25,
    stats: {
      maxHP: 30,
      armor: 16,
      attackBonus: 8,
      attackSpeed: 8,
      attackRange: 30,
      maxHit: 6,
      damageBonus: 1,
      moveSpeed: 0.2,
      maxSpeed: 0.5,
      critChance: 5,
      critDamage: 2,
    },
    dropTable: {
      always: ["bones"],
      common: ["bucket_helm"]
    }
  },
  doppelsoldner: {
    name: "doppelsoldner",
    type: UnitType.Crown,
    url: "doppelsoldner.png",
    width: 60,
    height: 120,
    expReward: 30,
    stats: {
      maxHP: 40,
      armor: 14,
      attackBonus: 10,
      attackSpeed: 8,
      attackRange: 60,
      maxHit: 12,
      damageBonus: 3,
      moveSpeed: 0.5,
      maxSpeed: 1.2,
      critChance: 25,
      critDamage: 2,
    },
    dropTable: {
      always: ["bones"],
      common: ["great_sword"]
    }
  },
  archer: {
    name: "archer",
    type: UnitType.Crown,
    url: "archer.png",
    width: 60,
    height: 110,
    expReward: 30,
    ranged: true,
    stats: {
      maxHP: 30,
      armor: 16,
      moveSpeed: 0.6,
      maxSpeed: 1.3,
      critChance: 25,
      critDamage: 2,
      attackRange: 300,
      attackBonus: 5,
      attackSpeed: 20,
      damageBonus: 1,
      maxHit: 8,
    },
    dropTable: {
      always: ["bones"],
      common: ["crossbow"],
    }
  }
}
