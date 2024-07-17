export enum AIType {
  MELEE,
  RANGED,
}

export enum AIState {
  ANY,
  IDLE,
  CHASE,
  ATTACK,
  FLEE,
}

export enum AIEventType {
  TARGET_ACQUIRED,
  TARGET_LOST,
  IN_ATTACK_RANGE,
  OUT_OF_ATTACK_RANGE,
  TAKE_DAMAGE,
}

export type AIEvent = {
  eid: number;
  type: AIEventType;
  // targetEid?: number
  priority?: number;
  data?: any;
};

export type StateTransition = (world: World, eid: number) => void;
