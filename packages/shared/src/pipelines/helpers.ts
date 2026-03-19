import { System } from "../types";

export const pipeline = (systems: System[]) => (world: World) => {
  for (const system of systems) system(world);
};
