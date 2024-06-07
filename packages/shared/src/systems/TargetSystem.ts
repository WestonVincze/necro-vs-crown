import { Not, defineQuery, defineSystem, hasComponent } from "bitecs"
import { Position, Target, Sprite, Behavior, Behaviors } from "../components";
import { Crown, Necro, Player } from "../components/Tags";

export const createTargetingSystem = () => {
  const necroTargetQuery = defineQuery([Target, Position, Sprite, Necro, Behavior]);
  const crownTargetQuery = defineQuery([Target, Position, Sprite, Crown]);

  return defineSystem(world => {
    const necroEntities = necroTargetQuery(world);
    const crownEntities = crownTargetQuery(world);

    const updateTargets = (sourceEntities: number[], targetEntities: number[]) => {
      for (let i = 0; i < sourceEntities.length; i++) {// sourceEid of sourceEntities) {

        let closestDistance = Infinity;
        let closestTarget = { x: 0, y: 0 };
        const eid = sourceEntities[i];
        if (hasComponent(world, Behavior, eid) && Behavior.type[eid] === Behaviors.FollowCursor) return;

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
            closestTarget = { x: tx, y: ty };
            closestDistance = distance;
          }
        }
        Target.x[eid] = closestTarget.x;
        Target.y[eid] = closestTarget.y;
      }
    }

    updateTargets(necroEntities, crownEntities);
    updateTargets(crownEntities, necroEntities);
    return world;
  })
}
