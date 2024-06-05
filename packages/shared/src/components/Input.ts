import { Types, defineComponent } from "bitecs";

/**
 * Input could contain a map of current player inputs
 * An input stream would handle updating this state and systems would process 
 * every frame as normal
 */

// boolean values
export const Input = defineComponent({
  moveX: Types.f32,
  moveY: Types.f32,
  castingSpell: Types.ui8,
});
