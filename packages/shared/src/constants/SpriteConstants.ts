import { SpriteTexture } from "../types";

export const TextureNames = Object.keys(SpriteTexture)
  .filter((key) => isNaN(Number(key)))
  .map((key) => key as keyof typeof SpriteTexture);
