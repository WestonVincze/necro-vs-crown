import { addComponent, defineRelation, removeComponent } from "bitecs";
import { AIStateMachine } from "./AIStateMachine";
import { AIEventType, AIState, AIType, StateTransition } from "../../../types";
import { MoveTarget } from "../../../relations";

// TODO: move state machine definitions to independent files
/** MELEE STATE MACHINE */
const exitChase: StateTransition = (world, eid) => {
  removeComponent(world, MoveTarget, eid);
}
const enterChase: StateTransition = (world, eid) => {
  // we need a way to pass the target eid
  const target = 0;
  addComponent(world, MoveTarget(0), eid);
}

export const createStateMachines = (stateMachines: Map<AIType, AIStateMachine>) => {
  const meleeFSM = new AIStateMachine();

  meleeFSM.addOnExitState(AIState.CHASE, exitChase);

  meleeFSM.addTransition(AIState.IDLE, AIEventType.TARGET_ACQUIRED, AIState.CHASE);
  meleeFSM.addTransition(AIState.CHASE, AIEventType.TARGET_LOST, AIState.IDLE);
  meleeFSM.addTransition(AIState.CHASE, AIEventType.IN_ATTACK_RANGE, AIState.ATTACK);
  meleeFSM.addTransition(AIState.ATTACK, AIEventType.TARGET_LOST, AIState.IDLE);
  meleeFSM.addTransition(AIState.ATTACK, AIEventType.OUT_OF_ATTACK_RANGE, AIState.CHASE)

  stateMachines.set(AIType.MELEE, meleeFSM);

  // other AI state machine types...
}