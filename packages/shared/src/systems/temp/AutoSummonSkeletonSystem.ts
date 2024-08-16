import { defineQuery, removeEntity } from "bitecs";
import { Bones, Position } from "$components";
import { createUnitEntity } from "$entities";
import { UnitName } from "$types";

/**
 * used for testing Solo Crown Mode
 */
export const createAutoSummonSkeletonsSystem = () => {
  const bonesQuery = defineQuery([Bones, Position]);
  return (world: World) => {
    for (const eid of bonesQuery(world)) {
      createUnitEntity(
        world,
        UnitName.Skeleton,
        Position.x[eid],
        Position.y[eid],
      );

      removeEntity(world, eid);
    }
    return world;
  };
};
