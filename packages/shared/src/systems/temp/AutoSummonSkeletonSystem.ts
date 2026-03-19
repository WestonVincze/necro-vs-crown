import { addComponent, query } from "bitecs";
import { Behavior, Behaviors, Bones, Dead, Position } from "../../components";
import { createUnitEntity } from "../../entities";
import { UnitName } from "../../types";

/**
 * used for testing Solo Crown Mode
 * * NOT CURRENTLY IN USE * *
 * There is an issue with the flow of eid's and onAdd/onRemove queues.
 * When a destroyed entity is put in a queue that event will be processed after
 */
export const createAutoSummonSkeletonsSystem = () => {
  const bonesQuery = (world: World) => query(world, [Bones, Position]);
  return (world: World) => {
    for (const eid of bonesQuery(world)) {
      const skeletonEid = createUnitEntity(
        world,
        UnitName.Skeleton,
        Position.x[eid],
        Position.y[eid],
      );
      addComponent(world, skeletonEid, Behavior);
      Behavior.type[skeletonEid] = Behaviors.AutoTarget;

      addComponent(world, eid, Dead);
    }
    return world;
  };
};
