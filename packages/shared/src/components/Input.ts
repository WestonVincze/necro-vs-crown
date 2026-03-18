/**
 * Input could contain a map of current player inputs
 * An input stream would handle updating this state and systems would process
 * every frame as normal
 */

// boolean values
export const Input = {
  moveX: [] as number[],
  moveY: [] as number[],
  castingSpell: [] as number[],
  /**
   * ** reference to current abilities **
   * ** -1 means no ability, otherwise map
   * ability1: Types.i8
   * ability2: Types.i8
   * ability3: Types.i8
   */
};
