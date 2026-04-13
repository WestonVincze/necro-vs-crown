import { type World } from "../../types";

export const updateWorldTime = (world: World) => {
  const now = performance.now();
  world.time.delta = now - world.time.then;
  world.time.elapsed += world.time.delta;
  world.time.then = now;
};
