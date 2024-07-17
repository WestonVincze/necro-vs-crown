import { Types, defineComponent } from "bitecs";

export const Item = defineComponent({
  itemId: Types.ui32,
});

export const Equipped = defineComponent({
  itemId: Types.ui32,
});

export const Inventory = defineComponent({
  // array of slots?
  // named slots?
  slot: Types.ui32,
});
