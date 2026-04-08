import { beforeEach, describe, expect, it } from "vitest";
import { addComponents, addEntity, createWorld, hasComponent } from "bitecs";
import {
  createSpellcastingSystem,
  createSpellEffectSystem,
} from "./SpellcastingSystem";
import {
  Input,
  Position,
  ResolveSpell,
  Spell,
  SpellCooldown,
  SpellEffect,
} from "../../components";
import { SpellState } from "../../types";

// TODO: add tests for specific spells
describe("SpellcastingSystems", () => {
  let world: World;
  let eid: number;

  beforeEach(() => {
    console.log("createWorld");
    world = createWorld();
    eid = addEntity(world);
  });

  describe("SpellcastingSystem", () => {
    const spellcastingSystem = createSpellcastingSystem();

    it("adds a [SpellEffect] when [Input] castingSpell is true, and [Spell] state is ready", () => {
      addComponents(world, eid, [Input, Position, Spell]);
      Input.castingSpell[eid] = 1;
      Spell.state[eid] = SpellState.Ready;

      expect(hasComponent(world, eid, SpellEffect)).toBe(false);
      spellcastingSystem(world);

      expect(hasComponent(world, eid, SpellEffect)).toBe(true);
    });

    it("adds [ResolveSpell] when [Input] is not casting and [Spell] state is casting", () => {
      addComponents(world, eid, [Input, Position, Spell, SpellEffect]);

      Input.castingSpell[eid] = -1;
      Spell.state[eid] = SpellState.Casting;

      spellcastingSystem(world);
      expect(hasComponent(world, eid, ResolveSpell)).toBe(true);
    });

    it("does nothing if the [Input] is not casting and spell is not currently casting", () => {
      addComponents(world, eid, [Input, Position, Spell]);
      Input.castingSpell[eid] = 0;
      Spell.state[eid] = SpellState.Ready;

      spellcastingSystem(world);
      expect(hasComponent(world, eid, SpellEffect)).toBe(false);
    });

    it("does nothing if the [Input] is casting and the [Spell] state is not ready", () => {
      addComponents(world, eid, [Input, Position, Spell]);
      Input.castingSpell[eid] = 1;
      Spell.state[eid] = SpellState.Casting;

      spellcastingSystem(world);
      expect(hasComponent(world, eid, SpellEffect)).toBe(false);
    });

    it("does nothing if entity also has [SpellCooldown]", () => {
      addComponents(world, eid, [Input, Position, Spell, SpellCooldown]);
      Input.castingSpell[eid] = 1;
      Spell.state[eid] = SpellState.Ready;

      spellcastingSystem(world);
      expect(hasComponent(world, eid, SpellEffect)).toBe(false);
    });
  });

  describe("SpellResolveSystem", () => {
    world = createWorld() as World;
    const spellResolveSystem = createSpellEffectSystem(world);

    it("increases [SpellEffect] size by growth rate", () => {
      addComponents(world, eid, [SpellEffect, Position]);
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
