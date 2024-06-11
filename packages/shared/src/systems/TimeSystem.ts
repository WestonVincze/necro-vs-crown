import { endOfFrame } from "../subjects";
import { type World } from "../types"

export const timeSystem = (world: World) => {
  const { time } = world;
  const now = performance.now();
  const delta = now - time.then;
  time.delta = delta;
  time.elapsed += delta;
  time.then = now;
  endOfFrame.next();
  return world;
}
