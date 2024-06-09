import { defineQuery, defineSystem, hasComponent } from "bitecs"
import { Position, Target, Sprite, Behavior, Behaviors } from "../components";
import { Crown, Necro } from "../components/Tags";
import { getCursorEid } from "./CursorTargetSystem";

export const createTargetingSystem = () => {
  const necroTargetQuery = defineQuery([Target, Position, Sprite, Necro, Behavior]);
  const crownTargetQuery = defineQuery([Target, Position, Sprite, Crown]);

  return defineSystem(world => {
    const necroEntities = necroTargetQuery(world);
    const crownEntities = crownTargetQuery(world);

    const updateTargets = (sourceEntities: number[], targetEntities: number[]) => {
      for (let i = 0; i < sourceEntities.length; i++) {// sourceEid of sourceEntities) {

        let closestDistance = Infinity;
        let closestTarget = -1;
        const eid = sourceEntities[i];
        if (hasComponent(world, Behavior, eid) && Behavior.type[eid] === Behaviors.FollowCursor) {
          const cursorEid = getCursorEid(world);
          if (cursorEid) {
            Target.eid[eid] = cursorEid;
          } 

          continue;
        }

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

        if (closestTarget !== -1) {
          Target.eid[eid] = closestTarget;
        }
      }
    }

    updateTargets(necroEntities, crownEntities);
    updateTargets(crownEntities, necroEntities);
    return world;
  })
}
