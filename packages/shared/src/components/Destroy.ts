import { Types, defineComponent } from "bitecs";

/**
 * Used to destroy entities after a delay
 */
export const DestroyEntity = defineComponent({ timeUntilDestroy: Types.f32 });

/**
 * Marks an entity as Dead
 */
export const Dead = defineComponent();

export const ItemDrops = defineComponent({
  item1: Types.ui8,
  item2: Types.ui8,
  item3: Types.ui8,
});

export const ExpReward = defineComponent({ amount: Types.ui8 });
