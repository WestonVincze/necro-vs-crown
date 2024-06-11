export enum SpriteTexture {
  /* UNITS */
  Necro,
  Skeleton,
  Peasant,
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
}

export const TextureNames = Object.keys(SpriteTexture)
  .filter((key) => isNaN(Number(key)))
  .map((key) => key as keyof typeof SpriteTexture);
