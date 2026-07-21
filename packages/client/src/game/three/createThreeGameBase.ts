import { createWorld } from "bitecs";
import { hasComponent } from "bitecs";
import { Grid } from "pathfinding";
import * as THREE from "three";
import {
  GameEvents,
  MAP_HEIGHT_TILES,
  MAP_WIDTH_TILES,
  SpellEffect,
  SpellName,
  SpriteTexture,
  Velocity,
  updateWorldTime,
  type World,
} from "@necro-crown/shared";
import type { Entry } from "$game/systems/ModelSystem";
import { modelBank } from "./ModelBank";
import { createHealthBarSystem } from "./HealthBarSystem";
import { createHitSplatSystem } from "./HitSplatSystem";
import { createDrawSpellEffectSystem } from "./DrawSpellEffectSystem";
import {
  ActionKind,
  ActionState,
  AnimatorStore,
  CastPhase,
  registerSpell,
  type Intent,
} from "$game/animation";

type ModelSystemBundle = {
  run: (world: World) => World;
  entries: Map<number, Entry>;
};

export interface AnimSystemBundle {
  animStore: AnimatorStore;
  modelSystem: ModelSystemBundle;
  animQuery: () => number[];
  animSystem: (world: World) => World;
}

export const createBaseWorld = (): World => {
  const world = createWorld() as World;
  world.time = { delta: 0, elapsed: 0, then: performance.now() };
  world.gameEvents = new GameEvents();
  world.networkType = "offline";
  world.unitUpgrades = {};
  world.experience = 0;
  world.paused = false;

  const gridData: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      row.push(0);
    }
    gridData.push(row);
  }
  world.grid = new Grid(gridData);

  return world;
};

export const initAnimationSystems = async (
  world: World,
  scene: THREE.Scene,
): Promise<AnimSystemBundle> => {
  await modelBank.ready;

  const animStore = new AnimatorStore();

  modelBank.forEach((textureId, data) => {
    const key = SpriteTexture[textureId]!;
    animStore.registerArchetype(key, data.animations);
  });

  for (const name of Object.values(SpellName).filter(
    (v): v is string => typeof v === "string",
  )) {
    registerSpell(name.toLowerCase());
  }

  const { createModelSystem } = await import("$game/systems/ModelSystem");
  const modelSystem = createModelSystem(world, scene, animStore);

  const animQuery = (): number[] => {
    const result: number[] = [];
    for (const [eid, entry] of modelSystem.entries) {
      if (entry.type === "model" && animStore.get(eid)) result.push(eid);
    }
    return result;
  };

  const animSystem = (w: World) => {
    const dt = w.time.delta / 1000;
    for (const eid of animQuery()) {
      let intent: Intent;
      if (hasComponent(w, eid, SpellEffect)) {
        const spellName = SpellName[SpellEffect.name[eid] as SpellName] ?? "";
        intent = {
          kind: ActionKind.Casting,
          spell: spellName,
          phase: CastPhase.Hold,
        };
      } else {
        const speedSq = Velocity.x[eid] ** 2 + Velocity.y[eid] ** 2;
        intent =
          speedSq > 1e-4
            ? { kind: ActionKind.Moving }
            : { kind: ActionKind.Idle };
      }
      const animator = animStore.get(eid)!;
      animator.update(intent, dt);
      ActionState.kind[eid] = intent.kind;
    }
    return w;
  };

  return { animStore, modelSystem, animQuery, animSystem };
};

export const createRenderSystems = (
  world: World,
  scene: THREE.Scene,
  animBundle: AnimSystemBundle,
) => {
  const drawSpellFx = createDrawSpellEffectSystem(world, scene);
  const healthBars = createHealthBarSystem(world, scene);
  const hitSplats = createHitSplatSystem(world, scene);

  return (w: World) => {
    drawSpellFx(w);
    healthBars(w);
    hitSplats(w);
    animBundle.modelSystem.run(w);
    animBundle.animSystem(w);
    return w;
  };
};

export const updateInspector = (
  animBundle: AnimSystemBundle,
  selectedEid: number,
) => {
  let entry: Entry | undefined =
    animBundle.modelSystem.entries.get(selectedEid);
  if (!entry && animBundle.modelSystem.entries.size > 0) {
    entry = animBundle.modelSystem.entries.values().next().value;
  }
  if (entry) {
    const hasModel = entry.type === "model";
    let animState = "N/A";
    let currentAnim = "N/A";
    let posX = 0;
    let posY = 0;
    if (entry.type === "model") {
      const anim = animBundle.animStore.get(entry.eid);
      const kind = ActionState.kind[entry.eid];
      animState =
        kind !== undefined
          ? (ActionKind[kind as ActionKind] ?? "unknown")
          : "N/A";
      currentAnim = anim?.currentClip ?? "(none)";
      posX = Math.round(entry.group.position.x);
      posY = Math.round(entry.group.position.z);
    } else {
      posX = Math.round(entry.mesh.position.x);
      posY = Math.round(entry.mesh.position.z);
    }
    return { hasModel, animState, currentAnim, posX, posY };
  }
  return {
    hasModel: false,
    animState: "N/A",
    currentAnim: "N/A",
    posX: 0,
    posY: 0,
  };
};
