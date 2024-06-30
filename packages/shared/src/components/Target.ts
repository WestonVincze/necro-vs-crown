import { Types, defineComponent } from "bitecs";

/**
 * Cursor is a 'singleton', there should only ever be one instance
 * MUST HAVE: [Position] 
 */
export const Cursor = defineComponent({ eid: Types.eid });
