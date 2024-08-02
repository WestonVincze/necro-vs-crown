import { Types, defineComponent } from "bitecs";

export const AttackCooldown = defineComponent({ timeUntilReady: Types.f32 });

export const SpellCooldown = defineComponent({ timeUntilReady: Types.f32 });
