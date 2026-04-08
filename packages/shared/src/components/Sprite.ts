import { f32, u8 } from "bitecs/serialization";
import { SpriteTexture } from "../types";

export const Sprite = {
  type: u8([]),
  texture: [] as SpriteTexture[],
  width: f32([]),
  height: f32([]),
};
