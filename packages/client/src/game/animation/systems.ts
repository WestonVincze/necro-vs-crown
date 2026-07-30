import { u8 } from "bitecs/serialization";
import type { Object3D } from "three";
import { Animator } from "./Animator";
import { ClipLibrary } from "./ClipLibrary";
import { ActionKind, CastPhase, type Intent } from "./types";

export const ActionState = {
  kind: u8([]),
};

export const Attacking = {};
export const Spawning = {};
export const Dying = {};

export interface CastingInfo {
  spell: string;
  phase: CastPhase;
}

export interface IntentSources {
  getSpeedSq(eid: number): number;
  getCasting(eid: number): CastingInfo | null;
  isAttacking(eid: number): boolean;
  isSpawning(eid: number): boolean;
  isDying(eid: number): boolean;
}

const MOVE_EPSILON_SQ = 1e-4;

export function deriveIntent(eid: number, s: IntentSources): Intent {
  if (s.isDying(eid)) return { kind: ActionKind.Dying };
  if (s.isSpawning(eid)) return { kind: ActionKind.Spawning };
  const casting = s.getCasting(eid);
  if (casting) {
    return {
      kind: ActionKind.Casting,
      spell: casting.spell,
      phase: casting.phase,
    };
  }
  if (s.isAttacking(eid)) return { kind: ActionKind.Attacking };
  if (s.getSpeedSq(eid) > MOVE_EPSILON_SQ) return { kind: ActionKind.Moving };
  return { kind: ActionKind.Idle };
}

export class AnimatorStore {
  private readonly animators = new Map<number, Animator>();
  private readonly libraries = new Map<string, ClipLibrary>();
  readonly culled = new Set<number>();

  registerArchetype(
    modelKey: string,
    clips: readonly import("three").AnimationClip[],
  ): void {
    if (!this.libraries.has(modelKey)) {
      this.libraries.set(modelKey, new ClipLibrary(clips));
    }
  }

  attach(eid: number, root: Object3D, modelKey: string): void {
    const lib = this.libraries.get(modelKey);
    if (!lib) {
      console.warn(
        `[AnimatorStore] unknown archetype "${modelKey}" for eid ${eid}`,
      );
      return;
    }
    this.animators.get(eid)?.dispose();
    this.animators.set(eid, new Animator(root, lib));
  }

  detach(eid: number): void {
    this.animators.get(eid)?.dispose();
    this.animators.delete(eid);
    this.culled.delete(eid);
  }

  get(eid: number): Animator | undefined {
    return this.animators.get(eid);
  }
}

export function createAnimationSystem<W>(
  store: AnimatorStore,
  sources: IntentSources,
  query: () => number[],
  getDelta: () => number,
) {
  return (world: W) => {
    const dt = getDelta();
    for (const eid of query()) {
      if (store.culled.has(eid)) continue;
      const animator = store.get(eid);
      if (!animator) continue;
      const intent = deriveIntent(eid, sources);
      animator.update(intent, dt);
      ActionState.kind[eid] = intent.kind;
    }
    return world;
  };
}
