import { defineEnterQueue, addComponent, defineQuery, removeComponent, removeEntity, defineExitQueue, Not } from "bitecs";
import { Spell, Input, SpellEffect, Position, SpellState, Bones, Behavior, Behaviors, Necro, Health, SpellName, SpellCooldown } from "../components";
import { GameObjects, Scene } from "phaser";
import { createUnitEntity } from "../entities";
import { healthChanges } from "../subjects";
import { checkIfWithinDistance, getPositionFromEid } from "../utils";
import type { World } from "../types";

export const createSpellcastingSystem = () => {
  const spellcasterQuery = defineQuery([Input, Position, Spell, Not(SpellCooldown)]);

  return (world: World) => {
    const entities = spellcasterQuery(world);
    for (const eid of entities) {
      const spellState = Spell.state[eid] as SpellState;

      if (spellState === SpellState.Ready && Input.castingSpell[eid] === 1) {
        Spell.state[eid] = SpellState.Casting;
        addComponent(world, SpellEffect, eid);

        SpellEffect.size[eid] = 30;
        SpellEffect.maxSize[eid] = 100;
        SpellEffect.growthRate[eid] = 1;
        SpellEffect.name[eid] = Spell.name[eid];
      }

      else if (spellState === SpellState.Casting && Input.castingSpell[eid] !== 1) {
        removeComponent(world, SpellEffect, eid)
        Spell.state[eid] = SpellState.Ready;
      }
    }

    return world;
  }
}

// TODO: abstract the client (Phaser related) logic into separate system
export const createDrawSpellEffectSystem = (scene: Scene) => {
  // TODO: make this compatible with other shapes and sprites
  const circlesById = new Map<number, GameObjects.Arc>();

  const query = defineQuery([SpellEffect, Position]);
  const onEnter = defineEnterQueue(query);
  const onExit = defineExitQueue(query);

  // TODO: avoid defining queries for every type of spell... this works for now though
  const bonesQuery = defineQuery([Bones, Position]);
  const necroUnitQuery = defineQuery([Necro, Position, Health]);

  return (world: World) => {
    // onEnter 
    for (const eid of onEnter(world)) {
      const x = Position.x[eid];
      const y = Position.y[eid];

      const circle = scene.add.circle(x, y, SpellEffect.size[eid], 0xc360eb, 0.5);
      circlesById.set(eid, circle);
    }

    // query
    for (const eid of query(world)) {
      // grow spell effect
      if (SpellEffect.size[eid] < SpellEffect.maxSize[eid]) {
        SpellEffect.size[eid] += Math.min(SpellEffect.maxSize[eid], SpellEffect.growthRate[eid]);
      } else if (SpellEffect.name[eid] === SpellName.HolyNova) {
        // TODO: generalize this for auto-resolving spell effects
        removeComponent(world, SpellEffect, eid, false);
        Spell.state[eid] = SpellState.Ready;
      }

      const circle = circlesById.get(eid);
      if (!circle) {
        console.warn(`Circle not found: Unable to modify spellEffect for ${eid}`);
        continue;
      }

      circle.setPosition(Position.x[eid], Position.y[eid]);
      circle.radius = SpellEffect.size[eid];
    }

    // onExit
    for (const eid of onExit(world)) {
      const position = getPositionFromEid(eid);
      addComponent(world, SpellCooldown, eid);
      SpellCooldown.ready[eid] = world.time.elapsed + 1000;
      switch (SpellEffect.name[eid]) {
        case SpellName.Summon:
          const boneEntities = bonesQuery(world);

          for (const boneEntity of boneEntities) {
            const bonePosition = getPositionFromEid(boneEntity);
            
            if (checkIfWithinDistance(position, bonePosition, SpellEffect.size[eid] + 50)) {
              removeEntity(world, boneEntity);
              const eid = createUnitEntity(world, "Skeleton", bonePosition.x, bonePosition.y);
              Behavior.type[eid] = Behaviors.FollowCursor;
            }
          }
          break;

        case SpellName.HolyNova:
          const necroEntities = necroUnitQuery(world);
          for (const necroEid of necroEntities) {
            const necroPosition = getPositionFromEid(necroEid);

            if (checkIfWithinDistance(position, necroPosition, SpellEffect.size[eid] + 50)) {
              healthChanges.next({ eid: necroEid, amount: -10 });
            }
          }
          break;
      }

      const circle = circlesById.get(eid);

      if (!circle) {
        console.warn(`Circle not found: Unable to delete circle for ${eid}`);
      } else {
        circle.destroy();
      }

      circlesById.delete(eid);

    }
    return world;
  }
}

export const createSpellFXSystem = () => {
  // creates, updates, and destroys the necessary FX for a spell
  /**
   * EX:
   * * instantiate initial graphic for a spell
   * * update graphic based on its state
   * * play SFX, add particles, update colors
   * * garbage collection
   */
}
