import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import { createHealthSystem } from "./HealthSystem";
import { Damage, Heal, Health } from "../../components";

const BASE_HP = 10;

describe("HealthSystem", () => {
  let world: World;
  let eid: number;
  const healthSystem = createHealthSystem();

  beforeEach(() => {
    world = createWorld();
    eid = addEntity(world);
    addComponent(world, Health, eid);
    Health.current[eid] = BASE_HP;
    Health.max[eid] = BASE_HP;
  });

  it("Can subtract [Damage] from [Health]", () => {
    addComponent(world, Damage, eid);
    Damage.amount[eid] = 5;

    healthSystem(world);
    expect(hasComponent(world, Damage, eid)).toBe(false);
    expect(Health.current[eid]).toBe(BASE_HP - 5);
  });

  it("Can add [Heal] to [Health]", () => {
    Health.current[eid] = BASE_HP - 5;
    addComponent(world, Heal, eid);
    Heal.amount[eid] = 5;

    healthSystem(world);

    expect(hasComponent(world, Heal, eid)).toBe(false);
    expect(Health.current[eid]).toBe(BASE_HP);
  });
});
