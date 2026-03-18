import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import { createHealthSystem } from "./HealthSystem";
import { Damage, Heal, Health } from "$components";

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

  it("Can subtract [Damage] from [Health]", () => {
    addComponent(world, eid, Damage);
    Damage.amount[eid] = 5;

    healthSystem(world);
    expect(hasComponent(world, eid, Damage)).toBe(false);
    expect(Health.current[eid]).toBe(BASE_HP - 5);
  });

  it("Can add [Heal] to [Health]", () => {
    Health.current[eid] = BASE_HP - 5;
    addComponent(world, eid, Heal);
    Heal.amount[eid] = 5;

    healthSystem(world);

    expect(hasComponent(world, eid, Heal)).toBe(false);
    expect(Health.current[eid]).toBe(BASE_HP);
  });
});
