import { type ComponentType, defineComponent, Types } from "bitecs";
import { Vector2 } from "../schemas";

export const Position: ComponentType<typeof Vector2> = defineComponent(Vector2);

export const GridCell =  defineComponent({ x: Types.ui16, y: Types.ui16 });

export const Transform = defineComponent({ width: Types.f32, height: Types.f32 });
