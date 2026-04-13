// Factions
export enum Faction {
  Necro = "Necro",
  Crown = "Crown",
}

// Units
export enum UnitName {
  Peasant = "Peasant",
  Guard = "Guard",
  Paladin = "Paladin",
  Doppelsoldner = "Doppelsoldner",
  Archer = "Archer",
  Skeleton = "Skeleton",
  Necromancer = "Necromancer",
  Militia = "Militia",
}

// AI behaviors
export enum Behaviors {
  FollowCursor,
  AutoTarget,
  Stationary,
}

// spellcasting
export enum SpellState {
  Ready,
  Casting,
}

export enum SpellName {
  Summon = 1,
  HolyNova,
}

// sprites
export enum SpriteType {
  Sprite,
  Rope,
}

export enum SpriteTexture {
  /* UNITS */
  Necromancer,
  Skeleton,
  Peasant,
  Militia,
  Guard,
  Paladin,
  Archer,
  Doppelsoldner,
  /* OBJECTS */
  Bones,
  /* ITEMS */
  MedHelm,
  BucketHelm,
  GreatSword,
  Crossbow,
  /* PROJECTILES */
  Arrow,
  /* BUILDINGS */
  Hut,
  Tower,
}

// stats
export enum StatName {
  MaxHealth = "MaxHealth",
  Armor = "Armor",
  HealthRegeneration = "HealthRegeneration",
  MoveSpeed = "MoveSpeed",
  MaxMoveSpeed = "MaxMoveSpeed",
  AttackBonus = "AttackBonus",
  AttackSpeed = "AttackSpeed",
  AttackRange = "AttackRange",
  MaxHit = "MaxHit",
  DamageBonus = "DamageBonus",
  CritChance = "CritChance",
  CritDamage = "CritDamage",
  CastingSpeed = "CastingSpeed",
  CastingRange = "CastingRange",
}
