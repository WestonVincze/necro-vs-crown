import { Types, defineComponent } from "bitecs";

// creating a component that will only have one entity seems wasteful
export const Cursor = defineComponent({ eid: Types.eid });
export const Target = defineComponent({ eid: Types.eid });
export const FollowTarget = defineComponent({ eid: Types.eid });
