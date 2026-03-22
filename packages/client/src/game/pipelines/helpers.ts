import type { System, World } from "@necro-crown/shared";

export const pipeline = (systems: System[]) => (world: World) => {
  for (const system of systems) system(world);
};
