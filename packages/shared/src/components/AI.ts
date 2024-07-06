import { Types, defineComponent } from "bitecs";

/**
 * represents the current state of an AI entity (behavior)
 */
export const AI = defineComponent({
  type: Types.ui8,
  state: Types.ui8,
})

/**
 * AIGoal represents a specific objective or action - not yet used (may not ever be)
 */
export const AIGoal = defineComponent({
  goalType: Types.ui8, // TODO: create enum with various goal types (none, moveTo, attack, etc...)
  // various goal data (x, y, etc...)
})
