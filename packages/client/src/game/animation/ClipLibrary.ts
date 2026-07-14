import type { AnimationClip } from "three";
import { type SpellSpec } from "./types";

export class ClipLibrary {
  private readonly byName = new Map<string, AnimationClip>();
  private readonly spells = new Map<string, SpellSpec>();

  readonly idle: string | null;
  readonly move: string | null;
  readonly attack: string | null;
  readonly spawn: string | null;
  readonly death: string | null;

  constructor(clips: readonly AnimationClip[]) {
    console.log(clips);
    for (const clip of clips) this.byName.set(clip.name, clip);

    this.idle = this.first("Idle");
    this.move = this.first("Move", "Walk");
    this.attack = this.first("Attack");
    this.spawn = this.first("Spawn");
    this.death = this.first("Death");

    const reserved = new Set(
      [
        this.idle,
        this.move,
        this.attack,
        this.spawn,
        this.death,
        "Walk",
      ].filter(Boolean),
    );
    const phases = new Map<
      string,
      { Start?: string; Hold?: string; End?: string }
    >();

    for (const name of this.byName.keys()) {
      if (reserved.has(name)) continue;
      const m = /^(.+)\.(Start|Hold|End)$/.exec(name);
      if (m) {
        const entry = phases.get(m[1]) ?? {};
        entry[m[2] as "Start" | "Hold" | "End"] = name;
        phases.set(m[1], entry);
      } else {
        this.spells.set(name, { form: "simple", clip: name });
      }
    }
    for (const [spell, p] of phases) {
      if (!p.Hold) {
        console.warn(
          `[ClipLibrary] spell "${spell}" has phase clips but no .hold; skipped`,
        );
        continue;
      }
      this.spells.set(spell, {
        form: "sequence",
        start: p.Start ?? null,
        hold: p.Hold,
        end: p.End ?? null,
      });
    }
  }

  clip(name: string): AnimationClip | null {
    return this.byName.get(name) ?? null;
  }

  spell(spellName: string): SpellSpec | null {
    return this.spells.get(spellName) ?? null;
  }

  get clipNames(): string[] {
    return [...this.byName.keys()];
  }

  private first(...names: string[]): string | null {
    for (const n of names) if (this.byName.has(n)) return n;
    return null;
  }
}
