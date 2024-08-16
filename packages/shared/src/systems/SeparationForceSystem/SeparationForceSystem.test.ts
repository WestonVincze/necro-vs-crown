import { beforeEach, describe, expect, it } from "vitest";
import { addComponents, addEntity, createWorld } from "bitecs";
import { createSeparationForceSystem } from "./SeparationForceSystem";
import { Input, Position } from "../../components";

describe("SeparationForceSystem", () => {
  let world: World;
  let eid: number;
  const separationForceSystem = createSeparationForceSystem();

  beforeEach(() => {
    world = createWorld();
    eid = addEntity(world);
    addComponents(world, [Position, Input], eid);
  });

  it("Modifies [Input] of entities that are too close to each other", () => {
    Position.x[eid] = 25;
    Position.y[eid] = 25;

    const target = addEntity(world);
    addComponents(world, [Position, Input], target);
    Position.x[target] = 20;
    Position.y[target] = 20;

    expect(Input.moveX[eid]).toBe(0);
    expect(Input.moveY[eid]).toBe(0);

    expect(Input.moveX[target]).toBe(0);
    expect(Input.moveY[target]).toBe(0);

    separationForceSystem(world);

    expect(Input.moveX[eid]).not.toBe(0);
    expect(Input.moveY[eid]).not.toBe(0);

    expect(Input.moveX[target]).not.toBe(0);
    expect(Input.moveY[target]).not.toBe(0);
  });

  it("Applies opposite force to separating entities", () => {
    Position.x[eid] = 20;
    Position.y[eid] = 20;

    const target = addEntity(world);
    addComponents(world, [Position, Input], target);
    Position.x[target] = 10;
    Position.y[target] = 10;

    separationForceSystem(world);

    expect(Input.moveX[eid] + Input.moveX[target]).toBe(0);
    expect(Input.moveY[eid] + Input.moveY[target]).toBe(0);
  });

  it("Does nothing to entities when they are too far away", () => {
    Position.x[eid] = 15;
    Position.y[eid] = 15;

    const target = addEntity(world);
    addComponents(world, [Position, Input], target);
    Position.x[target] = 75;
    Position.y[target] = 75;

    separationForceSystem(world);

    expect(Input.moveX[eid]).toBe(0);
    expect(Input.moveX[target]).toBe(0);
    expect(Input.moveY[eid]).toBe(0);
    expect(Input.moveY[target]).toBe(0);
  });

  it("Has 0 impact on [Input] when two entities are positioned on opposite sides of X axis", () => {
    Position.x[eid] = 10;
    Position.y[eid] = 15;

    const target1 = addEntity(world);
    addComponents(world, [Position, Input], target1);
    Position.x[target1] = 0;
    Position.y[target1] = 15;

    const target2 = addEntity(world);
    addComponents(world, [Position, Input], target2);
    Position.x[target2] = 20;
    Position.y[target2] = 15;

    separationForceSystem(world);

    expect(Input.moveX[eid]).toBe(0);
    expect(Input.moveY[eid]).toBe(0);

    expect(Input.moveX[target1]).toBeLessThan(0);
    expect(Input.moveY[target1]).toBe(0);

    expect(Input.moveX[target2]).toBeGreaterThan(0);
    expect(Input.moveY[target2]).toBe(0);
  });
});
