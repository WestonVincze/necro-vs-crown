import { createWorld } from "bitecs";
import { describe, expect, it } from "vitest";
import { updateWorldTime } from "./TimeSystem";

describe("TimeSystem", () => {
  let world: World;

  it("updates the world's time correctly", () => {
    world = createWorld();
    world.time = { elapsed: 0, delta: 0, then: 0 };
    updateWorldTime(world);
    expect(world.time.elapsed).toBeGreaterThan(0);
    expect(world.time.delta).toBeGreaterThan(0);
    expect(world.time.then).toBeGreaterThan(0);
  });
});
