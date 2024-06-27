import { defineRelation } from "bitecs";

export const CombatTarget = defineRelation({ exclusive: true });

export const MoveTarget = defineRelation({ exclusive: true });
