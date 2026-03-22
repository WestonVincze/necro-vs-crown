import type { System, World } from "../../../shared";

export const pipeline = (systems: System[]) => (world: World) => {
  for (const system of systems) system(world);
};
