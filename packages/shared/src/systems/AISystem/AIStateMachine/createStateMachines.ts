import { AIStateMachine } from "./AIStateMachine";
import { AIEventType, AIState, AIType, StateTransition } from "../../../types";

// TODO: move state machine definitions to independent files
/** MELEE STATE MACHINE */
const exitChase: StateTransition = (world, eid) => {
  // component cleanup
};

const enterChase: StateTransition = (world, eid) => {
  // add behavior components to entity based on how it should behave during chase
};

export const createStateMachines = (
  stateMachines: Map<AIType, AIStateMachine>,
) => {
  const meleeFSM = new AIStateMachine();

  meleeFSM.addOnExitState(AIState.CHASE, exitChase);
  meleeFSM.addOnEnterState(AIState.CHASE, enterChase);

  meleeFSM.addTransition(
    AIState.IDLE,
    AIEventType.TARGET_ACQUIRED,
    AIState.CHASE,
  );
  meleeFSM.addTransition(AIState.CHASE, AIEventType.TARGET_LOST, AIState.IDLE);
  meleeFSM.addTransition(
    AIState.CHASE,
    AIEventType.IN_ATTACK_RANGE,
    AIState.ATTACK,
  );
  meleeFSM.addTransition(AIState.ATTACK, AIEventType.TARGET_LOST, AIState.IDLE);
  meleeFSM.addTransition(
    AIState.ATTACK,
    AIEventType.OUT_OF_ATTACK_RANGE,
    AIState.CHASE,
  );

  stateMachines.set(AIType.MELEE, meleeFSM);

  // other AI state machine types...
};
