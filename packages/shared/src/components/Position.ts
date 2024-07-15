import { type ComponentType, defineComponent, Types } from "bitecs";
import { Vector2 } from "../schemas";

// TODO: consider using native arrays instead of typed
// export const Position = { x: [] as number[], y: [] as number[] };
// export const GridCell = { x: [] as number[], y: [] as number[] };
export const Position: ComponentType<typeof Vector2> = defineComponent(Vector2);

export const GridCell =  defineComponent({ x: Types.ui16, y: Types.ui16 });

export const Transform = defineComponent({ width: Types.f32, height: Types.f32, rotation: Types.f32 });
