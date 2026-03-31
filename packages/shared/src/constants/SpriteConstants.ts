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
}

export const TextureNames = Object.keys(SpriteTexture)
  .filter((key) => isNaN(Number(key)))
  .map((key) => key as keyof typeof SpriteTexture);
