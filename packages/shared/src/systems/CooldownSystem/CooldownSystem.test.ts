import {
  addComponent,
  addComponents,
  addEntity,
  createWorld,
  hasComponent,
} from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import { createCooldownSystem } from "./CooldownSystem";
import { AttackCooldown, Spell, SpellCooldown } from "../../components";

describe("CooldownSystem", () => {
  let world: World;
  let eid: number;
  const cooldownSystem = createCooldownSystem();

  beforeEach(() => {
    world = createWorld();
    world.time = {
      delta: 1,
      elapsed: 0,
      then: 0,
    };
    eid = addEntity(world);
  });

  it("removes [AttackCooldown] when the cooldown ends", () => {
    addComponent(world, eid, AttackCooldown);
    AttackCooldown.timeUntilReady[eid] = 2;
    cooldownSystem(world);
    expect(hasComponent(world, eid, AttackCooldown)).toBe(true);

    cooldownSystem(world);
    expect(hasComponent(world, eid, AttackCooldown)).toBe(false);
  });

  it("removes [SpellCooldown] when the cooldown ends", () => {
    addComponent(world, eid, SpellCooldown);
    SpellCooldown.timeUntilReady[eid] = 2;
    cooldownSystem(world);
    expect(hasComponent(world, eid, SpellCooldown)).toBe(true);

    cooldownSystem(world);
    expect(hasComponent(world, eid, SpellCooldown)).toBe(false);
  });

  it("removes all cooldown Components at once when their cooldowns end", () => {
    addComponents(world, eid, [AttackCooldown, SpellCooldown]);
    AttackCooldown.timeUntilReady[eid] = 1;
    SpellCooldown.timeUntilReady[eid] = 1;

    cooldownSystem(world);
    expect(hasComponent(world, eid, AttackCooldown)).toBe(false);
    expect(hasComponent(world, eid, SpellCooldown)).toBe(false);
  });
});
