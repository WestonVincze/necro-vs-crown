import { type UnitData, type CrownUnit, Faction, NecroUnit } from "../types"

export const CrownUnits: Record<CrownUnit, UnitData> = {
  Peasant: {
    name: "Peasant",
    type: Faction.Crown,
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
  Guard: {
    name: "Guard",
    type: Faction.Crown,
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
  Paladin: {
    name: "Paladin",
    type: Faction.Crown,
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
  Doppelsoldner: {
    name: "Doppelsoldner",
    type: Faction.Crown,
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
  Archer: {
    name: "Archer",
    type: Faction.Crown,
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

export const NecroUnits: Record<NecroUnit, UnitData> = {
  Skeleton: {
    name: "Skeleton",
    type: Faction.Necro,
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
  },
  Necromancer: {
    name: "Necromancer",
    type: Faction.Necro,
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

export const AllUnits = { ...CrownUnits, ...NecroUnits };
