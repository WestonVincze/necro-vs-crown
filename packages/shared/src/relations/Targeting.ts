import { createRelation, makeExclusive, withAutoRemoveSubject } from "bitecs";

export const CombatTarget = createRelation(
  makeExclusive,
  withAutoRemoveSubject,
);
export const MoveTarget = createRelation(makeExclusive, withAutoRemoveSubject);
