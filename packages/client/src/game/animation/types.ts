export enum ActionKind {
  Idle = 0,
  Moving = 1,
  Attacking = 2,
  Casting = 3,
  Spawning = 4,
  Dying = 5,
}

export const ACTION_PRIORITY: Record<ActionKind, number> = {
  [ActionKind.Idle]: 0,
  [ActionKind.Moving]: 30,
  [ActionKind.Attacking]: 60,
  [ActionKind.Casting]: 70,
  [ActionKind.Spawning]: 90,
  [ActionKind.Dying]: 100,
};

export enum CastPhase {
  None = 0,
  Start = 1,
  Hold = 2,
}

export type Intent =
  | { kind: ActionKind.Idle }
  | { kind: ActionKind.Moving }
  | { kind: ActionKind.Attacking }
  | { kind: ActionKind.Casting; spell: string; phase: CastPhase }
  | { kind: ActionKind.Spawning }
  | { kind: ActionKind.Dying };

export const priorityOf = (intent: Intent): number => ACTION_PRIORITY[intent.kind];

export const FADE_DEFAULTS: Record<ActionKind, number> = {
  [ActionKind.Idle]: 0.25,
  [ActionKind.Moving]: 0.2,
  [ActionKind.Attacking]: 0.1,
  [ActionKind.Casting]: 0.15,
  [ActionKind.Spawning]: 0,
  [ActionKind.Dying]: 0.1,
};

export interface SimpleSpell {
  form: 'simple';
  clip: string;
}

export interface SequenceSpell {
  form: 'sequence';
  start: string | null;
  hold: string;
  end: string | null;
}

export type SpellSpec = SimpleSpell | SequenceSpell;

export enum AnimLayer {
  FULL_BODY = 0,
}
