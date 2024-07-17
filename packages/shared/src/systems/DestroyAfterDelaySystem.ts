import { defineQuery, removeEntity } from "bitecs";
import { DestroyEntity } from "../components";
import { type World } from "../types";

/**
 * Destroys entities when the world time is equal to th components destroyTime
 */
export const createDestroyAfterDelaySystem = () => {
  const query = defineQuery([DestroyEntity]);

  return (world: World) => {
    for (const eid of query(world)) {
      DestroyEntity.timeUntilDestroy[eid] -= world.time.delta;
      if (DestroyEntity.timeUntilDestroy[eid] <= 0) {
        removeEntity(world, eid);
      }
    }

    return world;
  };
};
