import { Types, defineComponent } from "bitecs";
/**
 * NOT YET IMPLEMENTED
 */

/**
 * AIState represents the current state (behavior)
 */
export const AIState = defineComponent({
  state: Types.ui8, // TODO: define enum with various states (idle, patrolling, attacking, etc...)
  targetEntity: Types.ui32
});

/**
 * AIGoal represents a specific objective or action
 */
export const AIGoal = defineComponent({
  goalType: Types.ui8, // TODO: create enum with various goal types (none, moveTo, attack, etc...)
  // various goal data (x, y, etc...)
})
