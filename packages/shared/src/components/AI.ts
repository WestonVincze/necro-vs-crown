/**
 * represents the current state of an AI entity (behavior)
 */
export const AI = {
  type: [] as number[],
  state: [] as number[],
  // TODO: add AI configuration data (like flee_at_hp_percent)
};

/**
 * AIGoal represents a specific objective or action - not yet used (may not ever be)
 */
export const AIGoal = {
  goalType: [] as number[], // TODO: create enum with various goal types (none, moveTo, attack, etc...)
  // various goal data (x, y, etc...)
};

export const AIConfig = {
  fleeThreshold: [] as number[],
  // cooldowns?
  // chaseDistance?
};

export const AIAction = {
  currentAction: [] as number[],
  lastUtilityCalc: [] as number[],
  // cachedUtilities?
  // frameSinceLastCalculation: [] as number[]
};
