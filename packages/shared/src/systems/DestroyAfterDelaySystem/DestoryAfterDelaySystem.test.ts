import { beforeEach, describe, expect, it } from "vitest";
import { addComponent, addEntity, createWorld, entityExists } from "bitecs";
import { createDestroyAfterDelaySystem } from "./DestroyAfterDelaySystem";
import { DestroyEntity } from "$components";

describe("DestroyAfterDelaySystem", () => {
  let world: World;
  let eid: number;
  const destroyAfterDelaySystem = createDestroyAfterDelaySystem();

  beforeEach(() => {
    world = createWorld();
    world.time = {
      delta: 1,
      elapsed: 0,
      then: 0,
    };
    eid = addEntity(world);
    addComponent(world, DestroyEntity, eid);
  });

  it("destroys an entity after the delay", () => {
    expect(entityExists(world, eid)).toBe(true);
    DestroyEntity.timeUntilDestroy[eid] = 2;

    destroyAfterDelaySystem(world);
    expect(entityExists(world, eid)).toBe(true);

    destroyAfterDelaySystem(world);
    expect(entityExists(world, eid)).toBe(false);
  });

  it("destroys entity on first call if no time is provided", () => {
    expect(entityExists(world, eid)).toBe(true);

    destroyAfterDelaySystem(world);
    expect(entityExists(world, eid)).toBe(false);
  });
});
