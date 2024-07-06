import { AIType } from "../../types";
import { gameEvents } from "../../events";
import { AI } from "../../components";
import { AIStateMachine, createStateMachines } from "./AIStateMachine";


export const createAIEventsSystem = () => {
  const stateMachines: Map<AIType, AIStateMachine> = new Map();

  createStateMachines(stateMachines);

  return (world: World) => {
    // react to state transitions and call related logic
    gameEvents.AIEvents.subscribe((event) => {
      console.log(event.eid);
      console.log(event.type)

      const stateMachine = stateMachines.get(AI.type[event.eid]);
      if (!stateMachine) return;

      const currentState = AI.state[event.eid];

      const nextState = stateMachine.getNextState(currentState, event.type)
      if (!nextState) return;

      stateMachine.getOnExitState(currentState)?.(world, event.eid);
      stateMachine.getOnEnterState(nextState)?.(world, event.eid);

      AI.state[event.eid] = nextState;
    })

    return world;
  }
}


/**
 * State machines are stateless... they act as decision making tree that accepts the current state and data to determine which components should be on/off
 * 
 * aiBrain is reactive -> other systems and interactions can trigger events and the aiBrain will react accordingly
 * 
 * EX
 * * "TARGET_ACQUIRED" event emission is sent to aiBrain
 * * if current state has a handler for the event type its state will be altered and the necessary components will be modified
 * 
 * 
 * (later) component modifications should be buffered to happen at the start of the next frame
 * * events will have priority, if a higher priority event is emitted before the previous event is processed, only the highest priority event should be emitted
 * 
 * 
 * 
 * how do events get emitted and processed?
 * * map of "types" to state machines created
 * * each entity has a "type" that determines which state machine to pull
 * * event emitted with an EID, event type, and data
 * * * updateAISystem could read various parts of entity state and emit events? For example, it could check health every frame and if the percentage meets a threshold emit "FLEE" event
 * * * other systems will emit events, FSM reacts to these events and enables/disables behaviors by adding/removing components
 */


/**
 * AI DEBUGGING / UI
 * * create a system that renders a thought bubble above an entity to indicate their current state
 * * create a helper that can display the "decision making" state of an entity (target, cooldowns, etc)
 */
