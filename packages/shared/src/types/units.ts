export type Vector2 = { x: number, y: number }

export enum UnitType {
  Necro,
  Crown
}

export type CrownUnit =
  "peasant"           |
  "guard"             |
  "paladin"           |
  "doppelsoldner"     |
  "archer"            ;

export type NecroUnit =
  "skeleton"          |
  "necromancer"       ;

export type Unit = CrownUnit & NecroUnit;

export type UnitData = {
  name: string,
  type: UnitType,
  url: string,
  width: number,
  height: number,
  stats: Stats,
  ranged?: boolean,
  dropTable?: DropTable,
  expReward?: number,
}

export type DropTable = {
  always?: string[]
  common?: string[]
  rare?: string[]
  legendary?: string[]
}

// @DEPRECATED 
export type UnitOLD = {
  name: string
  width: number,
  height: number,
  vx?: number,
  vy?: number,
} & Vector2

// @DEPRECATED 
export type Stats = {
  maxHP: number 
  armor: number 
  HPregeneration?: number 
  moveSpeed?: number 
  maxSpeed?: number 
  attackSpeed?: number 
  attackRange?: number 
  attackBonus?: number 
  maxHit?: number 
  damageBonus?: number 
  critChance?: number 
  critDamage?: number 
  castingSpeed?: number 
  spellRadius?: number // TODO: this should be spell data, not a stat
  knockback?: number 
}
