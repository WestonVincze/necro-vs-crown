import { Health, HitSplat } from "./Health";
import { Position, Transform } from "./Position";
import { Sprite } from "./Sprite";

export const Networked = {};

export const networkSyncComponents = [
  Position,
  Sprite,
  Transform,
  Networked,
  Health,
  // HitSplat, TODO: fix this...
];
