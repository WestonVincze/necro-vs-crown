import {
  addComponent,
  defineQuery,
  defineSystem,
  getRelationTargets,
  hasComponent,
  removeComponent,
} from "bitecs";
import { Position, Behavior, Behaviors, Input, AI } from "../components";
import { Crown, Necro } from "../components";
import { getCursorEid } from "./CursorTargetSystem";
import { MoveTarget, CombatTarget } from "../relations";
import { getDistanceSquared, getPositionFromEid } from "../utils";

// THOUGHT: we could change this system to be reactive or include some dirty/clean flags to skip over target search when not required
export const createTargetingSystem = () => {
  const necroTargetQuery = defineQuery([AI, Behavior, Position, Necro]);
  const crownTargetQuery = defineQuery([AI, Behavior, Position, Crown]);

  const necroEnemiesQuery = defineQuery([Crown, Position]);
  const crownEnemiesQuery = defineQuery([Necro, Position]);

  return defineSystem((world) => {
    const necroEntities = necroTargetQuery(world);
    const crownEntities = crownTargetQuery(world);

    const necroEnemyEntities = necroEnemiesQuery(world);
    const crownEnemyEntities = crownEnemiesQuery(world);

    const updateTargets = (
      sourceEntities: readonly number[],
      targetEntities: readonly number[],
    ) => {
      for (const eid of sourceEntities) {
        let closestDistance = Infinity;
        let closestTarget: null | number = null;

        const position = getPositionFromEid(eid);

        for (const targetEid of targetEntities) {
          const targetPosition = getPositionFromEid(targetEid);

          const distance = getDistanceSquared(position, targetPosition);

          if (distance < closestDistance) {
            closestTarget = targetEid;
            closestDistance = distance;
          }
        }

        if (closestTarget !== null) {
          addComponent(world, CombatTarget(closestTarget), eid);
        }
      }
    };

    updateTargets(necroEntities, necroEnemyEntities);
    updateTargets(crownEntities, crownEnemyEntities);
    return world;
  });
};

export const createAssignFollowTargetSystem = () => {
  /**
   * This system should assign the "followTarget" of all entities.
   * Behavior should indicate how to assign values
   * example: with no behavior, the followTarget should just be the Target
   */

  const query = defineQuery([Behavior]);

  return (world: World) => {
    for (const eid of query(world)) {
      if (Behavior.type[eid] === Behaviors.FollowCursor) {
        const cursorEid = getCursorEid(world);
        if (!cursorEid) {
          console.warn(
            `Not found: FollowTarget could not be assigned to cursor for ${eid}`,
          );
          continue;
        }
        addComponent(world, MoveTarget(cursorEid), eid);
      } else if (
        Behavior.type[eid] === Behaviors.AutoTarget &&
        hasComponent(world, CombatTarget("*"), eid)
      ) {
        const target = getRelationTargets(world, CombatTarget, eid)[0];
        addComponent(world, MoveTarget(target), eid);
      }
    }
    return world;
  };
};
