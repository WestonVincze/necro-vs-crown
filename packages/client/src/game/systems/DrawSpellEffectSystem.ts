import {
  Position,
  ResolveSpell,
  SpellEffect,
  type World,
} from "@necro-crown/shared";
import { observe, onAdd, query } from "bitecs";
import type { GameObjects, Scene } from "phaser";

// TODO: abstract the client (Phaser related) logic into separate system
export const createDrawSpellEffectSystem = (world: World, scene: Scene) => {
  // TODO: make this compatible with other shapes and sprites
  const circlesById = new Map<number, GameObjects.Arc>();

  const spellEffectEnterQueue: number[] = [];
  observe(world, onAdd(SpellEffect), (eid) => {
    spellEffectEnterQueue.push(eid);
  });

  const spellResolveQueue: number[] = [];
  observe(world, onAdd(ResolveSpell), (eid) => spellResolveQueue.push(eid));

  return (world: World) => {
    const spellEffectsEntered = spellEffectEnterQueue.splice(0);
    for (const eid of spellEffectsEntered) {
      const circle = scene.add.circle(
        Position.x[eid],
        Position.y[eid],
        SpellEffect.size[eid],
        0xc360eb,
        0.5,
      );
      circlesById.set(eid, circle);
    }

    for (const eid of query(world, [SpellEffect, Position])) {
      const circle = circlesById.get(eid);
      if (!circle) {
        console.warn(
          `Circle not found: Unable to modify spellEffect for ${eid}`,
        );
        continue;
      }

      circle.setPosition(Position.x[eid], Position.y[eid]);
      circle.radius = SpellEffect.size[eid];
    }

    const spellResolvesEntered = spellResolveQueue.splice(0);
    for (const eid of spellResolvesEntered) {
      const circle = circlesById.get(eid);

      if (!circle) {
        console.warn(`Circle not found: Unable to delete circle for ${eid}`);
      } else {
        circle.destroy();
      }

      circlesById.delete(eid);
    }

    return world;
  };
};

export const createSpellFXSystem = () => {
  // creates, updates, and destroys the necessary FX for a spell
  /**
   * EX:
   * * instantiate initial graphic for a spell
   * * update graphic based on its state
   * * play SFX, add particles, update colors
   * * garbage collection
   */
};
