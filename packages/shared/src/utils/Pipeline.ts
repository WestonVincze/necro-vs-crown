import type { System, World } from "../types";

export const pipeline = (systems: System[]) => (world: World) => {
  for (const system of systems) system(world);
};

// Steppable pipeline: lets you enable "stepping" mode and advance systems
export type SteppableController = {
  stepping: boolean;
  currentIndex: number;
  requestedSteps: number;

  step(): void;
  stepMany(n: number): void;
  setStepping(enabled: boolean): void;
  reset(): void;
};

/**
 * createSteppablePipeline(systems)
 * - returns { run, controller }
 * - run(world) should be called each frame (same as pipeline)
 * - controller allows toggling stepping mode and requesting step(s)
 */
export const createSteppablePipeline = (systems: System[]) => {
  const controller: SteppableController = {
    stepping: false,
    currentIndex: 0,
    requestedSteps: 0,
    step() {
      controller.requestedSteps += 1;
    },
    stepMany(n: number) {
      controller.requestedSteps += Math.max(0, Math.floor(n));
    },
    setStepping(enabled: boolean) {
      controller.stepping = Boolean(enabled);
      // when disabling stepping mode, clear pending steps (optional)
      if (!controller.stepping) controller.requestedSteps = 0;
    },
    reset() {
      controller.currentIndex = 0;
      controller.requestedSteps = 0;
    },
  };

  const run = (world: World) => {
    // normal mode: run all systems
    if (!controller.stepping) {
      for (const system of systems) system(world);
      return;
    }

    // stepping mode: run at most requestedSteps systems this tick,
    // each step advances to the next system in sequence.
    let steps = controller.requestedSteps;
    if (steps <= 0) return;

    // cap steps to avoid running arbitrarily many in one tick
    const maxStepsThisTick = Math.min(steps, systems.length);
    for (let i = 0; i < maxStepsThisTick; i++) {
      const idx = controller.currentIndex % systems.length;
      try {
        systems[idx](world);
      } catch (err) {
        // avoid hard crash from one system — log and continue
        console.error("steppable pipeline system error at index", idx, err);
      }
      controller.currentIndex = (controller.currentIndex + 1) % systems.length;
    }
    controller.requestedSteps = Math.max(
      0,
      controller.requestedSteps - maxStepsThisTick,
    );
  };

  return { run, controller };
};
