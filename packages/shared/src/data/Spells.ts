import { type SpellName } from "../constants"
/**
 * Contains a list of spells and their related data
 */

/**
 * Sprite
 * MaxSize
 * Effect
 */
type SpellData = {
  name: SpellName,
  followTarget?: boolean,



}

export const Spells: Record<SpellName, string>  = {
  HolyNova: "test",
  Summon: "test"
}
