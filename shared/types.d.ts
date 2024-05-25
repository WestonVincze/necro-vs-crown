export type UnitData = {
  name: string
  type: string
  url: string
  width: number
  height: number
  stats: Stats
  ranged?: boolean
  dropTable?: DropTable
  expReward?: number,
  hideUI?: number,
  behavior?: () => void // no yet used
}

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

export type DropTable = {
  always?: string[]
  common?: string[]
  rare?: string[]
  legendary?: string[]
}
