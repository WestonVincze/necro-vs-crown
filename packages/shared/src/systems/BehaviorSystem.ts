/**
 * Controls the behavior of AI entities
 * 
 * * Query for AIState and AIGoal components
 * * Define logic for each state in an FSM or switch statement
 */

import { type World, defineQuery, query } from "bitecs";
import { AIGoal, AIState } from "../components/AI";

enum Goals {
  None,
  Chase,
  Flee,
}

export const createBehaviorSystem = () => {
  const behaviorQuery = defineQuery([AIState, AIGoal]);

  return (world: World) => {
    for (const eid in behaviorQuery(world)) {
      switch (AIGoal.goalType[eid]) {
        case Goals.None:
          break;
        case Goals.Chase:
          break;
        case Goals.Flee:
          break;
      }
    }

    return world;
  }
}
