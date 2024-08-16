import { StatName } from "$components";

export type Vector2 = { x: number; y: number };

export enum Faction {
  Necro,
  Crown,
}

export enum UnitName {
  Peasant,
  Guard,
  Paladin,
  Doppelsoldner,
  Archer,
  Skeleton,
  Necromancer,
}

export type UnitData = {
  name?: string;
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
  [StatName.MaxHealth]: number;
  [StatName.Armor]: number;
  [StatName.HealthRegeneration]?: number;
  [StatName.MoveSpeed]?: number;
  [StatName.MaxMoveSpeed]?: number;
  [StatName.AttackSpeed]?: number;
  [StatName.AttackRange]?: number;
  [StatName.AttackBonus]?: number;
  [StatName.MaxHit]?: number;
  [StatName.DamageBonus]?: number;
  [StatName.CritChance]?: number;
  [StatName.CritDamage]?: number;
  [StatName.CastingSpeed]?: number;
  [StatName.CastingRange]?: number;
  [StatName.Knockback]?: number;
};
