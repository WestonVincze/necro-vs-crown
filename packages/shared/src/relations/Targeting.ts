import { createRelation, makeExclusive, withAutoRemoveSubject } from "bitecs";

// TODO: targets should be removed if the target is slain
export const CombatTarget = createRelation(makeExclusive);
export const MoveTarget = createRelation(makeExclusive);
