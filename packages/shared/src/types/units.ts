export type Vector2 = { x: number; y: number };

export enum Faction {
  Necro,
  Crown,
}

export type CrownUnit =
  | "Peasant"
  | "Guard"
  | "Paladin"
  | "Doppelsoldner"
  | "Archer";

export type NecroUnit = "Skeleton" | "Necromancer";

export type Unit = CrownUnit | NecroUnit;

export type UnitData = {
  name: Unit;
  type: Faction;
  url: string;
  width: number;
  height: number;
  stats: Stats;
  ranged?: boolean;
  dropTable?: DropTable;
  expReward?: number;
};

export type DropTable = {
  always?: string[];
  common?: string[];
  rare?: string[];
  legendary?: string[];
};

export type Stats = {
  maxHP: number;
  armor: number;
  HPregeneration?: number;
  moveSpeed?: number;
  maxSpeed?: number;
  attackSpeed?: number;
  attackRange?: number;
  attackBonus?: number;
  maxHit?: number;
  damageBonus?: number;
  critChance?: number;
  critDamage?: number;
  castingSpeed?: number;
  spellRadius?: number; // TODO: this should be spell data, not a stat
  knockback?: number;
};
