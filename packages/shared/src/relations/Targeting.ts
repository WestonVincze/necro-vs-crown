import { defineRelation, removeComponent } from "bitecs";

export const CombatTarget = defineRelation({
  exclusive: true,
  onTargetRemoved: (world, subject, target) => {
    removeComponent(world, CombatTarget(target), subject);
  },
});

export const MoveTarget = defineRelation({
  exclusive: true,
  onTargetRemoved: (world, subject, target) => {
    removeComponent(world, MoveTarget(target), subject);
  },
});
