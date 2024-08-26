import { createWorld } from "bitecs";
import { describe, expect, it } from "vitest";
import { createTimeSystem } from "./TimeSystem";

describe("TimeSystem", () => {
  let world: World;
  const timeSystem = createTimeSystem();

  it("updates the world's time correctly", () => {
    world = createWorld();
    world.time = { elapsed: 0, delta: 0, then: 0 };
    timeSystem(world);
    expect(world.time.elapsed).toBeGreaterThan(0);
    expect(world.time.delta).toBeGreaterThan(0);
    expect(world.time.then).toBeGreaterThan(0);
  });
});
