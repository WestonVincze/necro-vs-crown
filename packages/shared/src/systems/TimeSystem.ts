import { endOfFrame } from "../subjects";

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
