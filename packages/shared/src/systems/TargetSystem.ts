import {
  addComponent,
  query,
  getRelationTargets,
  hasComponent,
  QueryResult,
  isNested,
  removeComponent,
  entityExists,
} from "bitecs";
import {
  Crown,
  Necro,
  Position,
  Behavior,
  Behaviors,
  AI,
  Cursor,
} from "../components";
import { MoveTarget, CombatTarget } from "../relations";
import { getDistanceSquared, getPositionFromEid } from "../utils";
import { type World } from "../types";

// THOUGHT: we could change this system to be reactive or include some dirty/clean flags to skip over target search when not required
export const createTargetingSystem = () => {
  return (world: World) => {
    const updateTargets = (
      sourceEntities: QueryResult,
      targetEntities: QueryResult,
    ) => {
      for (const eid of sourceEntities) {
        if (!entityExists(world, eid)) {
          console.warn(
            `${eid} does not exist but was queried in updateTargets`,
          );
          continue;
        }
        let closestDistance = Infinity;
        let closestTarget: null | number = null;

        const position = getPositionFromEid(eid);

        for (const targetEid of targetEntities) {
          if (!entityExists(world, targetEid)) {
            console.warn(
              `${targetEid} does not exist but was queried by ${eid} in updateTargets`,
            );
            continue;
          }
          const targetPosition = getPositionFromEid(targetEid);

          const distance = getDistanceSquared(position, targetPosition);

          if (distance < closestDistance) {
            closestTarget = targetEid;
            closestDistance = distance;
          }
        }

        if (closestTarget !== null) {
          addComponent(world, eid, CombatTarget(closestTarget));
        } else if (hasComponent(world, eid, CombatTarget("*"))) {
          removeComponent(world, eid, CombatTarget("*"));
        }
      }
    };

    updateTargets(
      query(world, [AI, Behavior, Position, Necro]),
      query(world, [Crown, Position], isNested),
    );
    updateTargets(
      query(world, [AI, Behavior, Position, Crown]),
      query(world, [Necro, Position], isNested),
    );
    return world;
  };
};

export const createAssignFollowTargetSystem = () => {
  /**
   * This system should assign the "followTarget" of all entities.
   * Behavior should indicate how to assign values
   * example: with no behavior, the followTarget should just be the Target
   */

  return (world: World) => {
    for (const eid of query(world, [Behavior])) {
      if (Behavior.type[eid] === Behaviors.FollowCursor) {
        const [cursorEid] = query(world, [Cursor], isNested);
        if (!cursorEid) {
          console.warn(
            `Not found: FollowTarget could not be assigned to cursor for ${eid}`,
          );
          continue;
        }
        addComponent(world, eid, MoveTarget(cursorEid));
      } else if (
        Behavior.type[eid] === Behaviors.AutoTarget &&
        hasComponent(world, eid, CombatTarget("*"))
      ) {
        const [target] = getRelationTargets(world, eid, CombatTarget);
        addComponent(world, eid, MoveTarget(target));
      }
    }
    return world;
  };
};
