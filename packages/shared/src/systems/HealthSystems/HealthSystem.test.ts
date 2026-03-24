import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHealthSystem } from "./HealthSystem";
import { Damage, Heal, Health, Position, Transform } from "../../components";
import { GameEvents } from "../../events";

const BASE_HP = 10;

describe("HealthSystem", () => {
  let world: World;
  let eid: number;
  const healthSystem = createHealthSystem();

  beforeEach(() => {
    world = createWorld();
    eid = addEntity(world);
    addComponent(world, eid, Health);
    Health.current[eid] = BASE_HP;
    Health.max[eid] = BASE_HP;
  });

  it("Can subtract [Damage] from [Health] and remove the [Damage] component", () => {
    addComponent(world, eid, Damage);
    Damage.amount[eid] = 5;

    healthSystem(world);
    expect(hasComponent(world, eid, Damage)).toBe(false);
    expect(Health.current[eid]).toBe(BASE_HP - 5);
  });

  it("Can add [Heal] to [Health] and remove the [Heal] component", () => {
    Health.current[eid] = BASE_HP - 5;
    addComponent(world, eid, Heal);
    Heal.amount[eid] = 5;

    healthSystem(world);

    expect(hasComponent(world, eid, Heal)).toBe(false);
    expect(Health.current[eid]).toBe(BASE_HP);
  });
});
describe("HitSplat events", () => {
  let world: World;
  let eid: number;
  const healthSystem = createHealthSystem();
  const gameEvents = new GameEvents();
  const hitSplatSpy = vi.spyOn(gameEvents.hitSplat$, "next");

  beforeEach(() => {
    world = createWorld();
    world.gameEvents = gameEvents;
    eid = addEntity(world);
    addComponent(world, eid, Health);
    Health.current[eid] = BASE_HP;
    Health.max[eid] = BASE_HP;
  });

  it("Does not emit a hitSplat event if there is no [Position]", () => {
    addComponent(world, eid, Damage);
    Damage.amount[eid] = 5;
    Damage.isCrit[eid] = 0;
    Position.x[eid] = 10;
    Position.y[eid] = 15;

    healthSystem(world);
    expect(hitSplatSpy).not.toBeCalled();
  });

  it("Can emit a hitSplat event if the entity has a [Position]", () => {
    addComponent(world, eid, Damage);
    addComponent(world, eid, Position);
    Damage.amount[eid] = 5;
    Damage.isCrit[eid] = 0;
    Position.x[eid] = 10;
    Position.y[eid] = 15;

    healthSystem(world);
    expect(hitSplatSpy).toHaveBeenLastCalledWith({
      amount: Damage.amount[eid],
      isCrit: Damage.isCrit[eid],
      position: { x: 10, y: 15 },
      colorSet: "red",
    });
  });

  it("Applies a yOffset if the entity also has a [Transform]", () => {
    addComponent(world, eid, Damage);
    addComponent(world, eid, Position);
    addComponent(world, eid, Transform);
    Damage.amount[eid] = 5;
    Damage.isCrit[eid] = 0;
    Position.x[eid] = 10;
    Position.y[eid] = 15;
    Transform.height[eid] = 10;

    healthSystem(world);
    expect(hitSplatSpy).toHaveBeenLastCalledWith({
      amount: Damage.amount[eid],
      isCrit: Damage.isCrit[eid],
      position: { x: 10, y: 10 },
      colorSet: "red",
    });
  });
});
