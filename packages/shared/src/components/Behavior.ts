import { Types, defineComponent } from "bitecs";

export enum Behaviors {
  FollowCursor,
  AutoTarget,
}

export const Behavior = defineComponent({
  type: Types.i8
})

export const FollowCursor = defineComponent();

export const FollowTarget = defineComponent();

export const AvoidTarget = defineComponent();
