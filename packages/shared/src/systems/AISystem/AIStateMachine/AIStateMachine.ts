import { AIEventType, AIState, StateTransition } from "$types";

// if we only add / remove components on enter and exit, lets just maintain a reference to a list of components that each state needs to have. When we transition we can compare the components we have with the components we need and update accordingly
export class AIStateMachine {
  // private states: Map<AIState, StateTransition> = new Map();
  private transitions: Map<AIState, Map<AIEventType, AIState>> = new Map();
  private onEnterState: Map<AIState, StateTransition> = new Map();
  private onExitState: Map<AIState, StateTransition> = new Map();

  /*
  addState(stateID: AIState, updateFn: StateTransition) {
    this.states.set(stateID, updateFn);
  }
  */

  addOnEnterState(state: AIState, handleEnter: StateTransition) {
    this.onEnterState.set(state, handleEnter);
  }

  addOnExitState(state: AIState, handleEnter: StateTransition) {
    this.onExitState.set(state, handleEnter);
  }

  addTransition(fromState: AIState, event: AIEventType, toState: AIState) {
    if (!this.transitions.has(fromState)) {
      this.transitions.set(fromState, new Map());
    }
    this.transitions.get(fromState)?.set(event, toState);
  }

  getOnEnterState(state: AIState): StateTransition | undefined {
    return this.onEnterState.get(state);
  }

  getOnExitState(state: AIState): StateTransition | undefined {
    return this.onExitState.get(state);
  }

  getNextState(currentState: AIState, event: AIEventType): AIState | undefined {
    return this.transitions.get(currentState)?.get(event);
  }
}
