import { describe, it, expect, beforeEach } from 'vitest';

/*
describe('AIManager', () => {
  let aiManager: AIManager;

  beforeEach(() => {
    aiManager = new AIManager();
  });

  it('should add and retrieve onEnterState handlers correctly', () => {
    const enterStateFn = () => console.log('Entering state');
    aiManager.addOnEnterState(AIState.Idle, enterStateFn);
    expect(aiManager.getOnEnterState(AIState.Idle)).toBe(enterStateFn);
  });

  it('should add and retrieve onExitState handlers correctly', () => {
    const exitStateFn = () => console.log('Exiting state');
    aiManager.addOnExitState(AIState.Idle, exitStateFn);
    expect(aiManager.getOnExitState(AIState.Idle)).toBe(exitStateFn);
  });

  it('should add transitions and retrieve the next state correctly', () => {
    aiManager.addTransition(AIState.Idle, AIEventType.SeeEnemy, AIState.Aggro);
    expect(aiManager.getNextState(AIState.Idle, AIEventType.SeeEnemy)).toBe(AIState.Aggro);
  });

  it('should return undefined for non-existent onEnterState', () => {
    expect(aiManager.getOnEnterState(AIState.Aggro)).toBeUndefined();
  });

  it('should return undefined for non-existent onExitState', () => {
    expect(aiManager.getOnExitState(AIState.Aggro)).toBeUndefined();
  });

  it('should return undefined for non-existent transition', () => {
    expect(aiManager.getNextState(AIState.Idle, AIEventType.LostSight)).toBeUndefined();
  });
});
*/