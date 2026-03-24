import { f32, u8 } from "bitecs/serialization";
export enum SpriteType {
  Sprite,
  Rope,
}

export const Sprite = {
  type: u8([]),
  texture: u8([]),
  width: f32([]),
  height: f32([]),
};
