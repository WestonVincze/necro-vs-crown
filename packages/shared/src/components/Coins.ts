import { defineComponent, Types } from "bitecs";

export const Coin = defineComponent({
  current: Types.ui8,
  max: Types.ui8,
});

export const SpendCoin = defineComponent({ amount: Types.ui8 });
export const AddCoin = defineComponent({ amount: Types.ui8 });

export const CoinAccumulator = defineComponent({
  amount: Types.ui8,
  frequency: Types.ui16,
  timeUntilNextPay: Types.f32,
});
