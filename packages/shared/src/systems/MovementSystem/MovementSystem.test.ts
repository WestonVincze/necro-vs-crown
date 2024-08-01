import {
  Input,
  MaxMoveSpeed,
  MoveSpeed,
  Position,
  Velocity,
} from "../../components";
import { addComponent, addEntity, createWorld } from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import { createMovementSystem } from "./MovementSystem";

describe("MovementSystem", () => {
  let world: World;
  let movementSystem: (world: World) => World;
  let eid: number;

  beforeEach(() => {
    world = createWorld();
    movementSystem = createMovementSystem();
    eid = addEntity(world);

    addComponent(world, Position, eid);
    Position.x[eid] = 0;
    Position.y[eid] = 0;

    addComponent(world, Velocity, eid);
    Velocity.x[eid] = 0;
    Velocity.y[eid] = 0;

    addComponent(world, MoveSpeed, eid);
    MoveSpeed.current[eid] = 1;
    MoveSpeed.base[eid] = 1;

    addComponent(world, MaxMoveSpeed, eid);
    MaxMoveSpeed.current[eid] = 1;
    MaxMoveSpeed.current[eid] = 1;

    addComponent(world, Input, eid);
  });

  it("can move to the right", () => {
    Input.moveX[eid] = 1;

    movementSystem(world);

    expect(Position.x[eid]).toBeGreaterThan(0);
    expect(Velocity.x[eid]).toBeGreaterThan(0);
  });

  it("can move to the left", () => {
    Input.moveX[eid] = -1;

    movementSystem(world);

    expect(Position.x[eid]).toBeLessThan(0);
    expect(Velocity.x[eid]).toBeLessThan(0);
  });

  it("can move up", () => {
    Input.moveY[eid] = 1;

    movementSystem(world);

    expect(Position.y[eid]).toBeGreaterThan(0);
    expect(Velocity.y[eid]).toBeGreaterThan(0);
  });

  it("can move down", () => {
    Input.moveY[eid] = -1;

    movementSystem(world);

    expect(Position.y[eid]).toBeLessThan(0);
    expect(Velocity.y[eid]).toBeLessThan(0);
  });

  it("can move diagonally", () => {
    Input.moveX[eid] = 1;
    Input.moveY[eid] = 1;

    movementSystem(world);

    expect(Position.x[eid]).toBeGreaterThan(0);
    expect(Velocity.x[eid]).toBeGreaterThan(0);
    expect(Position.y[eid]).toBeGreaterThan(0);
    expect(Velocity.y[eid]).toBeGreaterThan(0);
  });

  it("should move less on one axis if moving diagonally", () => {
    Input.moveX[eid] = 1;
    Input.moveY[eid] = 1;

    movementSystem(world);

    const diagonalMovementPositionY = Position.y[eid];

    Position.y[eid] = 0;
    Velocity.y[eid] = 0;

    Position.x[eid] = 0;
    Velocity.x[eid] = 0;
    Input.moveX[eid] = 0;

    movementSystem(world);

    const verticalMovementPositionY = Position.y[eid];

    expect(diagonalMovementPositionY).toBeLessThan(verticalMovementPositionY);
  });

  it("should do nothing if there is no input", () => {
    Input.moveX[eid] = 0;
    Input.moveY[eid] = 0;

    movementSystem(world);

    expect(Position.x[eid]).toBe(0);
    expect(Velocity.x[eid]).toBe(0);
    expect(Position.y[eid]).toBe(0);
    expect(Velocity.y[eid]).toBe(0);
  });

  it("should do nothing if movement speed is 0", () => {
    Input.moveX[eid] = 1;
    Input.moveY[eid] = 1;
    MoveSpeed.base[eid] = 0;
    MoveSpeed.current[eid] = 0;

    movementSystem(world);

    expect(Position.x[eid]).toBe(0);
    expect(Position.y[eid]).toBe(0);
    expect(Velocity.x[eid]).toBe(0);
    expect(Velocity.y[eid]).toBe(0);
  });

  it("should do nothing if max movement speed is 0", () => {
    Input.moveX[eid] = 1;
    Input.moveY[eid] = 1;
    MaxMoveSpeed.base[eid] = 0;
    MaxMoveSpeed.current[eid] = 0;

    movementSystem(world);

    expect(Position.x[eid]).toBe(0);
    expect(Position.y[eid]).toBe(0);
    expect(Velocity.x[eid]).toBe(0);
    expect(Velocity.y[eid]).toBe(0);
  });

  it("should not let Velocity surpass maxSpeed", () => {
    Input.moveX[eid] = 1;
    MoveSpeed.base[eid] = 1000;
    MoveSpeed.current[eid] = 1000;
    MaxMoveSpeed.base[eid] = 1;
    MaxMoveSpeed.current[eid] = 1;

    movementSystem(world);
    movementSystem(world);
    movementSystem(world);

    expect(Velocity.x[eid]).toBe(1);

    Input.moveX[eid] = -1;

    movementSystem(world);
    movementSystem(world);
    movementSystem(world);

    expect(Velocity.x[eid]).toBe(-1);
    expect(Position.x[eid]).toBe(0);
  });
});
