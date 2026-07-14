import * as THREE from "three";
import { ClipLibrary } from "./ClipLibrary";
import {
  ActionKind,
  AnimLayer,
  CastPhase,
  FADE_DEFAULTS,
  priorityOf,
  type Intent,
} from "./types";

interface Playing {
  key: string;
  action: THREE.AnimationAction;
  priority: number;
  locked: boolean;
  finished: boolean;
}

interface LayerState {
  current: Playing | null;
}

interface CastTracking {
  spell: string;
  reachedHold: boolean;
}

export class Animator {
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<string, THREE.AnimationAction>();
  private readonly layers: LayerState[] = [{ current: null }];
  private readonly warned = new Set<string>();

  private cast: CastTracking | null = null;
  private epilogue: string | null = null;

  constructor(
    root: THREE.Object3D,
    private readonly lib: ClipLibrary,
  ) {
    this.mixer = new THREE.AnimationMixer(root);
    this.mixer.addEventListener("finished", (e) => {
      for (const layer of this.layers) {
        if (layer.current?.action === e.action) layer.current.finished = true;
      }
    });
  }

  update(intent: Intent, dt: number): void {
    this.reconcile(intent);
    this.mixer.update(dt);
  }

  dispose(): void {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot() as THREE.Object3D);
    this.actions.clear();
  }

  get currentClip(): string | null {
    return this.layers[AnimLayer.FULL_BODY].current?.key ?? null;
  }

  private reconcile(intent: Intent): void {
    const layer = this.layers[AnimLayer.FULL_BODY];
    const target = this.resolveTarget(intent);
    if (!target) return;

    const cur = layer.current;

    if (cur && cur.key === target.key) {
      return;
    }

    if (cur && cur.locked && !cur.finished && target.priority <= cur.priority) {
      return;
    }

    this.play(layer, target);
  }

  private resolveTarget(
    intent: Intent,
  ): { key: string; priority: number; loop: boolean; locked: boolean; fade: number } | null {
    const layer = this.layers[AnimLayer.FULL_BODY];
    const cur = layer.current;
    const castPriority = priorityOf({ kind: ActionKind.Casting, spell: "", phase: CastPhase.Hold });

    if (this.epilogue) {
      if (cur?.key === this.epilogue && cur.finished) {
        this.epilogue = null;
      } else if (priorityOf(intent) <= castPriority) {
        return {
          key: this.epilogue,
          priority: castPriority,
          loop: false,
          locked: true,
          fade: FADE_DEFAULTS[ActionKind.Casting],
        };
      } else {
        this.epilogue = null;
      }
    }

    if (this.cast && intent.kind !== ActionKind.Casting) {
      const spec = this.lib.spell(this.cast.spell);
      const graceful = priorityOf(intent) <= castPriority;
      if (graceful && this.cast.reachedHold && spec?.form === "sequence" && spec.end) {
        this.epilogue = spec.end;
        this.cast = null;
        return {
          key: spec.end,
          priority: castPriority,
          loop: false,
          locked: true,
          fade: FADE_DEFAULTS[ActionKind.Casting],
        };
      }
      this.cast = null;
    }

    switch (intent.kind) {
      case ActionKind.Casting:
        return this.resolveCast(intent.spell, intent.phase, castPriority);

      case ActionKind.Dying:
        return this.oneShot(this.lib.death, intent, "Death");

      case ActionKind.Spawning:
        return this.oneShot(this.lib.spawn, intent, "Spawn");

      case ActionKind.Attacking:
        return this.oneShot(this.lib.attack, intent, "Attack");

      case ActionKind.Moving:
        return this.loop(this.lib.move, intent, "Move");

      case ActionKind.Idle:
        return this.loop(this.lib.idle, intent, "Idle");
    }
  }

  private resolveCast(
    spell: string,
    phase: CastPhase,
    priority: number,
  ): ReturnType<Animator["resolveTarget"]> {
    const spec = this.lib.spell(spell);
    if (!spec) {
      this.warnOnce(`no clips for spell "${spell}"`);
      return null;
    }
    const fade = FADE_DEFAULTS[ActionKind.Casting];

    if (spec.form === "simple") {
      this.cast = { spell, reachedHold: false };
      return { key: spec.clip, priority, loop: true, locked: false, fade };
    }

    if (this.cast?.spell !== spell) this.cast = { spell, reachedHold: false };

    const cur = this.layers[AnimLayer.FULL_BODY].current;
    const startDone = !spec.start || (cur?.key === spec.start && cur.finished);

    if (spec.start && !startDone && (phase === CastPhase.Start || !this.cast.reachedHold)) {
      return { key: spec.start, priority, loop: false, locked: true, fade };
    }

    this.cast.reachedHold = true;
    return { key: spec.hold, priority, loop: true, locked: false, fade };
  }

  private oneShot(
    clip: string | null,
    intent: Intent,
    label: string,
  ): ReturnType<Animator["resolveTarget"]> {
    if (!clip) {
      this.warnOnce(`model has no ${label} clip`);
      return null;
    }
    return {
      key: clip,
      priority: priorityOf(intent),
      loop: false,
      locked: true,
      fade: FADE_DEFAULTS[intent.kind],
    };
  }

  private loop(
    clip: string | null,
    intent: Intent,
    label: string,
  ): ReturnType<Animator["resolveTarget"]> {
    if (!clip) {
      this.warnOnce(`model has no ${label} clip`);
      return null;
    }
    return {
      key: clip,
      priority: priorityOf(intent),
      loop: true,
      locked: false,
      fade: FADE_DEFAULTS[intent.kind],
    };
  }

  private play(
    layer: LayerState,
    t: { key: string; priority: number; loop: boolean; locked: boolean; fade: number },
  ): void {
    const clip = this.lib.clip(t.key);
    if (!clip) {
      this.warnOnce(`clip "${t.key}" missing from model`);
      return;
    }

    let action = this.actions.get(t.key);
    if (!action) {
      action = this.mixer.clipAction(clip);
      this.actions.set(t.key, action);
    }

    action.reset();
    action.setLoop(t.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !t.loop;
    action.enabled = true;

    const prev = layer.current;
    if (prev && prev.action !== action) {
      action.crossFadeFrom(prev.action, t.fade, false);
    } else {
      action.fadeIn(t.fade);
    }
    action.play();

    layer.current = {
      key: t.key,
      action,
      priority: t.priority,
      locked: t.locked,
      finished: false,
    };
  }

  private warnOnce(msg: string): void {
    if (this.warned.has(msg)) return;
    this.warned.add(msg);
    console.warn(`[Animator] ${msg}`);
  }
}
