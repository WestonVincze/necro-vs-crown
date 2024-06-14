import { Necro, Player } from "../components";
import { defineQuery, defineSystem } from "bitecs";

export const createBehaviorSystem = () => {
  const necroPlayerQuery = defineQuery([Necro, Player]);

  return defineSystem(world => {
    for (const eid in necroPlayerQuery(world)) {
      // avoid enemies
    }

    return world;
  })
}