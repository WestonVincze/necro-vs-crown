import { beforeEach, describe, expect, it } from "vitest";
import { addComponents, addEntity, createWorld, hasComponent } from "bitecs";
import {
  createSpellcastingSystem,
  createSpellResolveSystem,
} from "./SpellcastingSystem";
import {
  Input,
  Position,
  Spell,
  SpellCooldown,
  SpellEffect,
  SpellState,
} from "../../components";

// TODO: add tests for specific spells
describe("SpellcastingSystems", () => {
  let world: World;
  let eid: number;

  beforeEach(() => {
    world = createWorld();
    eid = addEntity(world);
  });

  describe("SpellcastingSystem", () => {
    const spellcastingSystem = createSpellcastingSystem();

    it("adds a [SpellEffect] when [Input] castingSpell is true, and [Spell] state is ready", () => {
      addComponents(world, [Input, Position, Spell], eid);
      Input.castingSpell[eid] = 1;
      Spell.state[eid] = SpellState.Ready;

      expect(hasComponent(world, SpellEffect, eid)).toBe(false);
      spellcastingSystem(world);

      expect(hasComponent(world, SpellEffect, eid)).toBe(true);
    });

    it("removes [SpellEffect] when [Input] is not casting and [Spell] state is casting", () => {
      addComponents(world, [Input, Position, Spell, SpellEffect], eid);

      Input.castingSpell[eid] = -1;
      Spell.state[eid] = SpellState.Casting;

      spellcastingSystem(world);
      expect(hasComponent(world, SpellEffect, eid)).toBe(false);
    });

    it("does nothing if the [Input] is not casting and spell is not currently casting", () => {
      addComponents(world, [Input, Position, Spell], eid);
      Input.castingSpell[eid] = 0;
      Spell.state[eid] = SpellState.Ready;

      spellcastingSystem(world);
      expect(hasComponent(world, SpellEffect, eid)).toBe(false);
    });

    it("does nothing if the [Input] is casting and the [Spell] state is not ready", () => {
      addComponents(world, [Input, Position, Spell], eid);
      Input.castingSpell[eid] = 1;
      Spell.state[eid] = SpellState.Casting;

      spellcastingSystem(world);
      expect(hasComponent(world, SpellEffect, eid)).toBe(false);
    });

    it("does nothing if entity also has [SpellCooldown]", () => {
      addComponents(world, [Input, Position, Spell, SpellCooldown], eid);
      Input.castingSpell[eid] = 1;
      Spell.state[eid] = SpellState.Ready;

      spellcastingSystem(world);
      expect(hasComponent(world, SpellEffect, eid)).toBe(false);
    });
  });

  describe("SpellResolveSystem", () => {
    const spellResolveSystem = createSpellResolveSystem();

    it("increases [SpellEffect] size by growth rate", () => {
      addComponents(world, [SpellEffect, Position], eid);
      SpellEffect.size[eid] = 0;
      SpellEffect.growthRate[eid] = 5;
      SpellEffect.maxSize[eid] = 10;

      spellResolveSystem(world);
      expect(SpellEffect.size[eid]).toBe(5);

      spellResolveSystem(world);
      expect(SpellEffect.size[eid]).toBe(10);

      spellResolveSystem(world);
      expect(SpellEffect.size[eid]).toBe(10);
    });
  });
});
