import { Health } from "./Health";
import { Position, Transform } from "./Position";
import { ResolveSpell, SpellEffect } from "./Spellcasting";
import { Sprite } from "./Sprite";
import { Crown, Necro, Player } from "./Tags";

export const Networked = {};

export const networkSyncComponents = [
  Position,
  Sprite,
  Transform,
  Networked,
  Health,
  SpellEffect,
  ResolveSpell,
  Player,
  Crown,
  Necro,
];
