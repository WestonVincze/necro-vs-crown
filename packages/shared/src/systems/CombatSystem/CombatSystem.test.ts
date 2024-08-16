import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addComponent,
  addComponents,
  addEntity,
  createWorld,
  entityExists,
  getAllEntities,
  hasComponent,
  query,
  removeComponent,
  resetGlobals,
} from "bitecs";
import { createCombatSystem } from "./CombatSystem";
import {
  Armor,
  AttackCooldown,
  AttackRange,
  AttackSpeed,
  Damage,
  Health,
  MaxHit,
  Position,
  Projectile,
  RangedUnit,
} from "$components";
import { CombatTarget } from "$relations";
import * as utils from "$utils";

describe("Combat System and helpers", () => {
  describe("CombatSystem", () => {
    let world: World;
    let attacker: number;
    let combatSystem: (world: World) => World;

    const consoleWarnSpy = vi.spyOn(console, "warn");
    const checkIfWithinDistanceSpy = vi.spyOn(utils, "checkIfWithinDistance");
    const rollDamageSpy = vi.spyOn(utils, "rollDamage");

    beforeEach(() => {
      world = createWorld();
      world.time = { delta: 0, elapsed: 0, then: performance.now() };
      attacker = addEntity(world);
      combatSystem = createCombatSystem();

      addComponent(world, AttackSpeed, attacker);
      AttackSpeed.base[attacker] = 1;
      AttackSpeed.current[attacker] = 1;

      addComponent(world, AttackRange, attacker);
      AttackRange.base[attacker] = 1;
      AttackRange.current[attacker] = 1;

      addComponent(world, MaxHit, attacker);
      MaxHit.base[attacker] = 5;
      MaxHit.current[attacker] = 5;

      addComponent(world, Position, attacker);
      Position.x[attacker] = 0;
      Position.y[attacker] = 0;

      vi.clearAllMocks();
    });

    afterEach(() => {
      resetGlobals();
    });

    it("calls each of the helper functions", () => {
      const target = addEntity(world);
      addComponent(world, CombatTarget(target), attacker);

      combatSystem(world);

      expect(checkIfWithinDistanceSpy).toHaveBeenCalledOnce();
      expect(rollDamageSpy).toHaveBeenCalledOnce();
    });

    it("adds AttackCooldown when an attack is made", () => {
      const target = addEntity(world);
      addComponent(world, CombatTarget(target), attacker);

      addComponents(world, [Armor, Health], target);

      combatSystem(world);

      expect(hasComponent(world, AttackCooldown, attacker)).toBe(true);
    });

    it("displays a warning if the target entity does not exist", () => {
      const fake_entity = 5;
      expect(entityExists(world, fake_entity)).toBe(false);

      addComponent(world, CombatTarget(fake_entity), attacker);

      combatSystem(world);
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
    });

    it("creates a projectile if the attacker is a RangedUnit", () => {
      const target = addEntity(world);
      addComponents(world, [Armor, Health], target);
      addComponent(world, CombatTarget(target), attacker);

      combatSystem(world);

      expect(query(world, [Projectile]).length).toBe(0);

      removeComponent(world, AttackCooldown, attacker);
      addComponent(world, RangedUnit, attacker);

      combatSystem(world);

      expect(query(world, [Projectile]).length).toBe(1);
    });

    it("adds Damage component and amount when an attack is rolled", () => {
      const MOCK_DAMAGE = 5;
      rollDamageSpy.mockReturnValue(MOCK_DAMAGE);
      const target = addEntity(world);
      addComponent(world, CombatTarget(target), attacker);

      addComponents(world, [Armor, Health], target);
      Armor.current[target] = 0;

      combatSystem(world);

      expect(hasComponent(world, Damage, target)).toBe(true);
      expect(Damage.amount[target]).toBe(MOCK_DAMAGE);
    });
  });
});
