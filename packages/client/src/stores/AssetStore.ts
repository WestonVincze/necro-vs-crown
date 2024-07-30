import { SpriteTexture } from "@necro-crown/shared";
import { writable } from "svelte/store";

export const assets = writable<Record<SpriteTexture, string>>({
  [SpriteTexture.Necromancer]: "necro.png",
  [SpriteTexture.Skeleton]: "skele.png",
  [SpriteTexture.Peasant]: "peasant.png",
  [SpriteTexture.Guard]: "guard.png",
  [SpriteTexture.Paladin]: "paladin.png",
  [SpriteTexture.Doppelsoldner]: "doppelsoldner.png",
  [SpriteTexture.Archer]: "archer.png",
  [SpriteTexture.Bones]: "bones.png",
  [SpriteTexture.MedHelm]: "med_helm.png",
  [SpriteTexture.BucketHelm]: "bucket_helm.png",
  [SpriteTexture.GreatSword]: "great_sword.png",
  [SpriteTexture.Crossbow]: "crossbow.png",
  [SpriteTexture.Arrow]: "arrow.png",
});
