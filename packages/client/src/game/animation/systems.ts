import { u8, u16 } from "bitecs/serialization";
import type { Object3D } from "three";
import { Animator } from "./Animator";
import { ClipLibrary } from "./ClipLibrary";
import { ActionKind, CastPhase, type Intent } from "./types";

export const ActionState = {
  kind: u8([]),
};

export const Casting = {
  spellId: u16([]),
  phase: u8([]),
};

export const Attacking = {};
export const Spawning = {};
export const Dying = {};

export interface IntentSources {
  getSpeedSq(eid: number): number;
  isCasting(eid: number): boolean;
  isAttacking(eid: number): boolean;
  isSpawning(eid: number): boolean;
  isDying(eid: number): boolean;
}

const MOVE_EPSILON_SQ = 1e-4;

export function deriveIntent(eid: number, s: IntentSources): Intent {
  if (s.isDying(eid)) return { kind: ActionKind.Dying };
  if (s.isSpawning(eid)) return { kind: ActionKind.Spawning };
  if (s.isCasting(eid)) {
    return {
      kind: ActionKind.Casting,
      spell: spellNameOf(Casting.spellId[eid]),
      phase: Casting.phase[eid] as CastPhase,
    };
  }
  if (s.isAttacking(eid)) return { kind: ActionKind.Attacking };
  if (s.getSpeedSq(eid) > MOVE_EPSILON_SQ) return { kind: ActionKind.Moving };
  return { kind: ActionKind.Idle };
}

export function createActionStateSystem(
  sources: IntentSources,
  query: (world: any) => number[],
) {
  return (world: any) => {
    for (const eid of query(world)) {
      ActionState.kind[eid] = deriveIntent(eid, sources).kind;
    }
    return world;
  };
}

const spellNames: string[] = ["<none>"];
const spellIds = new Map<string, number>([["<none>", 0]]);

export function registerSpell(name: string): number {
  const existing = spellIds.get(name);
  if (existing !== undefined) return existing;
  const id = spellNames.length;
  spellNames.push(name);
  spellIds.set(name, id);
  return id;
}

export const spellNameOf = (id: number): string => spellNames[id] ?? "<none>";
export const spellIdOf = (name: string): number => spellIds.get(name) ?? 0;

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

export function createAnimationSystem(
  store: AnimatorStore,
  sources: IntentSources,
  query: (world: any) => number[],
  getDelta: () => number,
) {
  return (world: any) => {
    const dt = getDelta();
    for (const eid of query(world)) {
      if (store.culled.has(eid)) continue;
      const animator = store.get(eid);
      if (!animator) continue;
      animator.update(deriveIntent(eid, sources), dt);
    }
    return world;
  };
}
