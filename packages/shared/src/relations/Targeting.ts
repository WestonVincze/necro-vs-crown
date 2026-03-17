import { createRelation, makeExclusive, withAutoRemoveSubject } from "bitecs";

export const CombatTarget = createRelation(makeExclusive);
export const MoveTarget = createRelation(makeExclusive);
