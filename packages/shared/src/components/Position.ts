import { ComponentType, defineComponent } from "bitecs";
import { Vector2 } from "../schemas";

export const Position: ComponentType<typeof Vector2> = defineComponent(Vector2);
