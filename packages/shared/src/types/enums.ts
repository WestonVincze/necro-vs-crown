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
  Necromancer = "Necromancer",
  Skeleton = "Skeleton",
  Peasant = "Peasant",
  Militia = "Militia",
  Guard = "Guard",
  Paladin = "Paladin",
  Archer = "Archer",
  Doppelsoldner = "Doppelsoldner",
  /* OBJECTS */
  Bones = "Bones",
  /* ITEMS */
  MedHelm = "MedHelm",
  BucketHelm = "BucketHelm",
  GreatSword = "GreatSword",
  Crossbow = "Crossbow",
  /* PROJECTILES */
  Arrow = "Arrow",
  /* BUILDINGS */
  Hut = "Hut",
  Tower = "Tower",
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
  Knockback = "Knockback",
}
