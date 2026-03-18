import { beforeEach, describe, expect, it } from "vitest";
import { addComponents, addEntity, createWorld } from "bitecs";
import { createSeparationForceSystem } from "./SeparationForceSystem";
import { SeparationForce, Position, GridCell } from "$components";
import { getGridCellFromPosition } from "$utils";

describe("SeparationForceSystem", () => {
  let world: World;
  let eid: number;
  const separationForceSystem = createSeparationForceSystem();

  beforeEach(() => {
    world = createWorld();
    eid = addEntity(world);
    addComponents(world, eid, [Position, GridCell, SeparationForce]);
    SeparationForce.x[eid] = 0;
    SeparationForce.y[eid] = 0;
  });

  it("Modifies [SeparationForce] of entities that are too close to each other", () => {
    Position.x[eid] = 25;
    Position.y[eid] = 25;
    const gridCell = getGridCellFromPosition({ x: 25, y: 25 });
    GridCell.x[eid] = gridCell.x;
    GridCell.y[eid] = gridCell.y;

    const target = addEntity(world);
    addComponents(world, target, [Position, GridCell, SeparationForce]);
    Position.x[target] = 20;
    Position.y[target] = 20;
    const targetGridCell = getGridCellFromPosition({ x: 20, y: 20 });
    GridCell.x[target] = targetGridCell.x;
    GridCell.y[target] = targetGridCell.y;
    SeparationForce.x[target] = 0;
    SeparationForce.y[target] = 0;

    expect(SeparationForce.x[eid]).toBe(0);
    expect(SeparationForce.y[eid]).toBe(0);

    expect(SeparationForce.x[target]).toBe(0);
    expect(SeparationForce.y[target]).toBe(0);

    separationForceSystem(world);

    expect(SeparationForce.x[eid]).not.toBe(0);
    expect(SeparationForce.y[eid]).not.toBe(0);

    expect(SeparationForce.x[target]).not.toBe(0);
    expect(SeparationForce.y[target]).not.toBe(0);
  });

  it("Applies opposite force to separating entities", () => {
    Position.x[eid] = 20;
    Position.y[eid] = 20;
    const gridCell = getGridCellFromPosition({ x: 20, y: 20 });
    GridCell.x[eid] = gridCell.x;
    GridCell.y[eid] = gridCell.y;

    const target = addEntity(world);
    addComponents(world, target, [Position, GridCell, SeparationForce]);
    Position.x[target] = 10;
    Position.y[target] = 10;
    const targetGridCell = getGridCellFromPosition({ x: 10, y: 10 });
    GridCell.x[target] = targetGridCell.x;
    GridCell.y[target] = targetGridCell.y;
    SeparationForce.x[target] = 0;
    SeparationForce.y[target] = 0;

    separationForceSystem(world);

    expect(SeparationForce.x[eid] + SeparationForce.x[target]).toBe(0);
    expect(SeparationForce.y[eid] + SeparationForce.y[target]).toBe(0);
  });

  it("Does nothing to entities when they are too far away", () => {
    Position.x[eid] = 15;
    Position.y[eid] = 15;
    const gridCell = getGridCellFromPosition({ x: 15, y: 15 });
    GridCell.x[eid] = gridCell.x;
    GridCell.y[eid] = gridCell.y;

    const target = addEntity(world);
    addComponents(world, target, [Position, GridCell, SeparationForce]);
    Position.x[target] = 75;
    Position.y[target] = 75;
    const targetGridCell = getGridCellFromPosition({ x: 75, y: 75 });
    GridCell.x[target] = targetGridCell.x;
    GridCell.y[target] = targetGridCell.y;
    SeparationForce.x[target] = 0;
    SeparationForce.y[target] = 0;

    separationForceSystem(world);

    expect(SeparationForce.x[eid]).toBe(0);
    expect(SeparationForce.x[target]).toBe(0);
    expect(SeparationForce.y[eid]).toBe(0);
    expect(SeparationForce.y[target]).toBe(0);
  });

  it("Has 0 impact on [SeparationForce] when two entities are positioned on opposite sides of X axis", () => {
    Position.x[eid] = 10;
    Position.y[eid] = 15;
    const gridCell = getGridCellFromPosition({ x: 10, y: 15 });
    GridCell.x[eid] = gridCell.x;
    GridCell.y[eid] = gridCell.y;

    const target1 = addEntity(world);
    addComponents(world, target1, [Position, GridCell, SeparationForce]);
    Position.x[target1] = 0;
    Position.y[target1] = 15;
    const target1GridCell = getGridCellFromPosition({ x: 0, y: 15 });
    GridCell.x[target1] = target1GridCell.x;
    GridCell.y[target1] = target1GridCell.y;
    SeparationForce.x[target1] = 0;
    SeparationForce.y[target1] = 0;

    const target2 = addEntity(world);
    addComponents(world, target2, [Position, GridCell, SeparationForce]);
    Position.x[target2] = 20;
    Position.y[target2] = 15;
    const target2GridCell = getGridCellFromPosition({ x: 20, y: 15 });
    GridCell.x[target2] = target2GridCell.x;
    GridCell.y[target2] = target2GridCell.y;
    SeparationForce.x[target2] = 0;
    SeparationForce.y[target2] = 0;

    separationForceSystem(world);

    expect(SeparationForce.x[eid]).toBe(0);
    expect(SeparationForce.y[eid]).toBe(0);

    expect(SeparationForce.x[target1]).toBeLessThan(0);
    expect(SeparationForce.y[target1]).toBe(0);

    expect(SeparationForce.x[target2]).toBeGreaterThan(0);
    expect(SeparationForce.y[target2]).toBe(0);
  });
});
