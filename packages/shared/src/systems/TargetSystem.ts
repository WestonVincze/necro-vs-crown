import { addComponent, defineQuery, defineSystem, hasComponent, removeComponent } from "bitecs"
import { Position, Target, Sprite, Behavior, Behaviors, FollowTarget } from "../components";
import { Crown, Necro } from "../components/Tags";
import { getCursorEid } from "./CursorTargetSystem";

export const createTargetingSystem = () => {
  const necroTargetQuery = defineQuery([Behavior, Position, Necro]);
  const crownTargetQuery = defineQuery([Behavior, Position, Crown]);

  const necroEnemiesQuery = defineQuery([Crown, Position]);
  const crownEnemiesQuery = defineQuery([Necro, Position]);

  return defineSystem(world => {
    const necroEntities = necroTargetQuery(world);
    const crownEntities = crownTargetQuery(world);

    const necroEnemyEntities = necroEnemiesQuery(world);
    const crownEnemyEntities = crownEnemiesQuery(world);

    const updateTargets = (sourceEntities: number[], targetEntities: number[]) => {
      for (let i = 0; i < sourceEntities.length; i++) {
        let closestDistance = Infinity;
        let closestTarget = -1;
        const eid = sourceEntities[i];

        const sx = Position.x[eid];
        const sy = Position.y[eid];

        for (let j = 0; j < targetEntities.length; j++) { //targetEid of targetEntities) {
          const targetEid = targetEntities[j];
          const tx = Position.x[targetEid];
          const ty = Position.y[targetEid];
          const dx = sx - tx;
          const dy = sy - ty;

          const distance = (dx ** 2) + (dy ** 2);

          if (distance < closestDistance) {
            closestTarget = targetEid;
            closestDistance = distance;
          }
        }

        // TODO: this is buggy, when there are no targets left we don't actually remove component
        if (closestTarget !== -1) {
          addComponent(world, Target, eid);
          Target.eid[eid] = closestTarget;
        } else {
          removeComponent(world, Target, eid);
        }

        // TODO: separate FollowTarget logic from TargetSystem into separate system (below)
        if (Behavior.type[eid] === Behaviors.FollowCursor) {
          const cursorEid = getCursorEid(world);
          if (!cursorEid) {
            console.warn(`Not found: FollowTarget could not be assigned to cursor for ${eid}`);
            return;
          } 

          addComponent(world, FollowTarget, eid);
          FollowTarget.eid[eid] = cursorEid;
        } else if (closestTarget !== 1) {
          addComponent(world, FollowTarget, eid);
          FollowTarget.eid[eid] = Target.eid[eid];
        } else {
          removeComponent(world, FollowTarget, eid);
        }
      }
    }

    updateTargets(necroEntities, necroEnemyEntities);
    updateTargets(crownEntities, crownEnemyEntities);
    return world;
  })
}

const createAssignFollowTargetSystem = () => {
  /**
   * This system should assign the "followTarget" of all entities.
   * Behavior should indicate how to assign values
   * example: with no behavior, the followTarget should just be the Target
   */

}
