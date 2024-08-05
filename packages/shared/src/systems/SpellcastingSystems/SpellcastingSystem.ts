import {
  defineEnterQueue,
  addComponent,
  defineQuery,
  removeComponent,
  removeEntity,
  defineExitQueue,
  Not,
  removeComponents,
} from "bitecs";
import { GameObjects, Scene } from "phaser";
import {
  Spell,
  Input,
  SpellEffect,
  Position,
  SpellState,
  Bones,
  Behavior,
  Behaviors,
  Necro,
  Health,
  SpellName,
  SpellCooldown,
  ResolveSpell,
  Damage,
} from "../../components";
import { createUnitEntity } from "../../entities";
import { checkIfWithinDistance, getPositionFromEid } from "../../utils";
import { UnitName } from "../../types";

export const createSpellcastingSystem = () => {
  const spellcasterQuery = defineQuery([
    Input,
    Position,
    Spell,
    Not(SpellCooldown),
  ]);

  return (world: World) => {
    for (const eid of spellcasterQuery(world)) {
      const spellState = Spell.state[eid] as SpellState;

      if (spellState === SpellState.Ready && Input.castingSpell[eid] === 1) {
        Spell.state[eid] = SpellState.Casting;
        addComponent(world, SpellEffect, eid);

        SpellEffect.size[eid] = 30;
        SpellEffect.maxSize[eid] = 100;
        SpellEffect.growthRate[eid] = 1;
        SpellEffect.name[eid] = Spell.name[eid];
      } else if (
        spellState === SpellState.Casting &&
        Input.castingSpell[eid] !== 1
      ) {
        addComponent(world, ResolveSpell, eid);
        Spell.state[eid] = SpellState.Ready;
      }
    }

    return world;
  };
};

export const createSpellEffectSystem = () => {
  const spellEffectQuery = defineQuery([SpellEffect, Position]);
  const spellResolveQuery = defineQuery([SpellEffect, Position, ResolveSpell]);
  const spellResolveQueue = defineEnterQueue(spellResolveQuery);

  // TODO: avoid defining queries for every type of spell... this works for now though
  const bonesQuery = defineQuery([Bones, Position]);
  const necroUnitQuery = defineQuery([Necro, Position, Health]);

  return (world: World) => {
    for (const eid of spellEffectQuery(world)) {
      // grow spell effect
      if (SpellEffect.size[eid] < SpellEffect.maxSize[eid]) {
        SpellEffect.size[eid] += Math.min(
          SpellEffect.maxSize[eid],
          SpellEffect.growthRate[eid],
        );
      } else if (SpellEffect.name[eid] === SpellName.HolyNova) {
        // TODO: generalize this for auto-resolving spell effects
        removeComponent(world, SpellEffect, eid);
        Spell.state[eid] = SpellState.Ready;
      }
    }

    for (const eid of spellResolveQueue(world)) {
      const position = getPositionFromEid(eid);
      addComponent(world, SpellCooldown, eid);
      SpellCooldown.timeUntilReady[eid] = 1000;
      // TODO: figure out why summon spell sometimes casts holy nova
      switch (SpellEffect.name[eid]) {
        case SpellName.Summon:
          const boneEntities = bonesQuery(world);

          for (const boneEntity of boneEntities) {
            const bonePosition = getPositionFromEid(boneEntity);

            if (
              checkIfWithinDistance(
                position,
                bonePosition,
                SpellEffect.size[eid] + 50,
              )
            ) {
              removeEntity(world, boneEntity);
              const skeleton = createUnitEntity(
                world,
                UnitName.Skeleton,
                bonePosition.x,
                bonePosition.y,
              );
              Behavior.type[skeleton] = Behaviors.FollowCursor;
            }
          }
          break;

        case SpellName.HolyNova:
          const necroEntities = necroUnitQuery(world);
          for (const necroEid of necroEntities) {
            const necroPosition = getPositionFromEid(necroEid);

            if (
              checkIfWithinDistance(
                position,
                necroPosition,
                SpellEffect.size[eid] + 50,
              )
            ) {
              addComponent(world, Damage, necroEid);
              Damage.amount[eid] = 10;
            }
          }
          break;
      }

      removeComponents(world, [SpellEffect, ResolveSpell], eid);
    }

    return world;
  };
};

// TODO: abstract the client (Phaser related) logic into separate system
export const createDrawSpellEffectSystem = (scene: Scene) => {
  // TODO: make this compatible with other shapes and sprites
  const circlesById = new Map<number, GameObjects.Arc>();

  const spellEffectQuery = defineQuery([SpellEffect, Position]);
  const spellEffectEnterQueue = defineEnterQueue(spellEffectQuery);

  const spellResolveQuery = defineQuery([SpellEffect, ResolveSpell]);
  const spellResolveQueue = defineExitQueue(spellResolveQuery);

  return (world: World) => {
    for (const eid of spellEffectEnterQueue(world)) {
      const circle = scene.add.circle(
        Position.x[eid],
        Position.y[eid],
        SpellEffect.size[eid],
        0xc360eb,
        0.5,
      );
      circlesById.set(eid, circle);
    }

    for (const eid of spellEffectQuery(world)) {
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

    for (const eid of spellResolveQueue(world)) {
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
