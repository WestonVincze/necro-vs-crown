import { defineComponent, defineRelation, Types } from "bitecs";

export const SpawnTarget = defineRelation({ exclusive: true });

export const Spawner = defineComponent({
  timeUntilSpawn: Types.f32,
  xMin: Types.f32,
  xMax: Types.f32,
  yMin: Types.f32,
  yMax: Types.f32,
});
