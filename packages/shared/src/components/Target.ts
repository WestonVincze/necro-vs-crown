import { Types, defineComponent } from "bitecs";

/**
 * Cursor is a 'singleton', there should only ever be one instance
 * MUST HAVE: [Position] 
 */
export const Cursor = defineComponent({ eid: Types.eid });

/**
 * Referenced eid
 * MUST HAVE: [Position]
 * SHOULD HAVE: [Armor, Health]
 */
export const Target = defineComponent({ eid: Types.eid });

/**
 * Referenced eid
 * MUST HAVE: [Position]
 */
export const FollowTarget = defineComponent({ eid: Types.eid });
