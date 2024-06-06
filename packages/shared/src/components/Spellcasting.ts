import { Types, defineComponent } from 'bitecs';

export const Spell = defineComponent({
  name: Types.ui8,
  type: Types.ui8,
});

export const SpellEffect = defineComponent({
  duration: Types.f32,
  type: Types.ui8,
});
