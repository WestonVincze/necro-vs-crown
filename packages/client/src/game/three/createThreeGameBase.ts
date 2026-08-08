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
  Attacking,
  CastPhase,
  Dying,
  Spawning,
  createAnimationSystem,
  type IntentSources,
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

  const { createModelSystem } = await import("$game/systems/ModelSystem");
  const modelSystem = createModelSystem(world, scene, animStore);

  const animQuery = (): number[] => {
    const result: number[] = [];
    for (const [eid, entry] of modelSystem.entries) {
      if (entry.type === "model" && animStore.get(eid)) result.push(eid);
    }
    return result;
  };

  const intentSources: IntentSources = {
    getSpeedSq: (eid) => Velocity.x[eid] ** 2 + Velocity.y[eid] ** 2,
    getCasting: (eid) =>
      hasComponent(world, eid, SpellEffect)
        ? {
            spell: SpellName[SpellEffect.name[eid] as SpellName] ?? "",
            phase: CastPhase.Hold,
          }
        : null,
    isAttacking: (eid) => hasComponent(world, eid, Attacking),
    isSpawning: (eid) => hasComponent(world, eid, Spawning),
    isDying: (eid) => hasComponent(world, eid, Dying),
  };

  const animSystem = createAnimationSystem<World>(
    animStore,
    intentSources,
    animQuery,
    () => world.time.delta / 1000,
  );

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

/** Simulation rate. Gameplay advances in steps of this size, never by real frame time. */
export const FIXED_TIMESTEP_MS = 1000 / 60;

const MAX_STEPS_PER_FRAME = 5;

export interface GameLoopOptions {
  world: World;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  /** Gameplay systems. Runs once per fixed step, so `world.time.delta` is constant. */
  simulate: (world: World) => void;
  /** Low-frequency systems (targeting, follow assignment). */
  tick?: (world: World) => void;
  tickIntervalMs?: number;
  /** Runs once per rendered frame, just before the draw call. */
  onBeforeRender?: () => void;
}

export interface GameLoop {
  stop: () => void;
  /** Advance exactly one fixed step and redraw — used by the dev tools while paused. */
  stepFrame: () => void;
  stepTick: () => void;
}

export const startGameLoop = ({
  world,
  renderer,
  scene,
  camera,
  simulate,
  tick,
  tickIntervalMs = 200,
  onBeforeRender,
}: GameLoopOptions): GameLoop => {
  let rafId = 0;
  let accumulator = 0;
  let tickAccumulator = 0;
  let lastTime = performance.now();

  const step = () => {
    world.time.delta = FIXED_TIMESTEP_MS;
    world.time.elapsed += FIXED_TIMESTEP_MS;
    world.time.then = performance.now();

    simulate(world);

    if (tick) {
      tickAccumulator += FIXED_TIMESTEP_MS;
      if (tickAccumulator >= tickIntervalMs) {
        tick(world);
        tickAccumulator = 0;
      }
    }
  };

  const draw = () => {
    onBeforeRender?.();
    renderer.render(scene, camera);
  };

  const frame = () => {
    rafId = requestAnimationFrame(frame);

    const now = performance.now();
    const frameTime = now - lastTime;
    lastTime = now;

    // Time spent paused is discarded rather than simulated on resume.
    if (world.paused) return;

    accumulator += Math.min(frameTime, MAX_STEPS_PER_FRAME * FIXED_TIMESTEP_MS);

    while (accumulator >= FIXED_TIMESTEP_MS) {
      step();
      accumulator -= FIXED_TIMESTEP_MS;
    }

    draw();
  };

  rafId = requestAnimationFrame(frame);

  return {
    stop: () => cancelAnimationFrame(rafId),
    stepFrame: () => {
      step();
      draw();
    },
    stepTick: () => tick?.(world),
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
