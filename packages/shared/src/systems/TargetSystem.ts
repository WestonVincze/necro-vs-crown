import { defineQuery, defineSystem, hasComponent } from "bitecs"
import { Position, Target, Sprite, Behavior, Behaviors } from "../components";
import { Crown, Necro } from "../components/Tags";

export const createTargetingSystem = () => {
  const necroTargetQuery = defineQuery([Target, Position, Sprite, Necro, Behavior]);
  const crownTargetQuery = defineQuery([Target, Position, Sprite, Crown]);

  return defineSystem(world => {
    const necroEntities = necroTargetQuery(world);
    const crownEntities = crownTargetQuery(world);

    const updateTargets = (sourceEntities: number[], targetEntities: number[]) => {
      for (const sourceEid of sourceEntities) {
        if (hasComponent(world, Behavior, sourceEid) && Behavior.type[sourceEid] === Behaviors.FollowCursor) return;

        let closestDistance = Infinity;
        let closestTarget = { x: 0, y: 0 };

        const sx = Position.x[sourceEid];
        const sy = Position.y[sourceEid];

        for (const targetEid of targetEntities) {
          const tx = Position.x[targetEid];
          const ty = Position.y[targetEid];
          const dx = sx - tx;
          const dy = sy - ty;

          const distance = (dx ** 2) + (dy ** 2);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = { x: tx, y: ty };
          }
        }
        Target.x[sourceEid] = closestTarget.x;
        Target.y[sourceEid] = closestTarget.y;
      }
    }

    updateTargets(necroEntities, crownEntities);
    updateTargets(crownEntities, necroEntities);
    return world;
  })
}
