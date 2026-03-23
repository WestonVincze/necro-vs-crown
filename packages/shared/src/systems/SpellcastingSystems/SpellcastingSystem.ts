import {
  addComponent,
  query,
  removeComponent,
  Not,
  observe,
  onAdd,
  isNested,
} from "bitecs";
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
  Dead,
} from "../../components";
import { createUnitEntity } from "../../entities";
import { checkIfWithinDistance, getPositionFromEid } from "../../utils";
import { UnitName, type World } from "../../types";

export const createSpellcastingSystem = () => {
  const spellcasterQuery = (world: World) =>
    query(world, [Input, Position, Spell, Not(SpellCooldown)]);

  return (world: World) => {
    for (const eid of spellcasterQuery(world)) {
      const spellState = Spell.state[eid] as SpellState;

      if (spellState === SpellState.Ready && Input.castingSpell[eid] === 1) {
        Spell.state[eid] = SpellState.Casting;
        addComponent(world, eid, SpellEffect);

        SpellEffect.size[eid] = 30;
        SpellEffect.maxSize[eid] = 100;
        SpellEffect.growthRate[eid] = 1;
        SpellEffect.name[eid] = Spell.name[eid];
      } else if (
        spellState === SpellState.Casting &&
        Input.castingSpell[eid] !== 1
      ) {
        addComponent(world, eid, ResolveSpell);
        Spell.state[eid] = SpellState.Ready;
      }
    }

    return world;
  };
};

export const createSpellEffectSystem = (world: World) => {
  const spellResolveQueue: number[] = [];
  observe(world, onAdd(ResolveSpell), (eid) => spellResolveQueue.push(eid));

  // TODO: avoid defining queries for every type of spell... this works for now though

  return (world: World) => {
    for (const eid of query(world, [SpellEffect, Position])) {
      // grow spell effect
      if (SpellEffect.size[eid] < SpellEffect.maxSize[eid]) {
        SpellEffect.size[eid] += Math.min(
          SpellEffect.maxSize[eid],
          SpellEffect.growthRate[eid],
        );
      } else if (SpellEffect.name[eid] === SpellName.HolyNova) {
        // TODO: generalize this for auto-resolving spell effects
        addComponent(world, eid, ResolveSpell);
        Spell.state[eid] = SpellState.Ready;
      }
    }

    const spellResolvesEntered = spellResolveQueue.splice(0);
    for (const eid of spellResolvesEntered) {
      const position = getPositionFromEid(eid);
      addComponent(world, eid, SpellCooldown);
      SpellCooldown.timeUntilReady[eid] = 1000;
      switch (SpellEffect.name[eid]) {
        case SpellName.Summon:
          for (const boneEntity of query(world, [Bones, Position], isNested)) {
            const bonePosition = getPositionFromEid(boneEntity);

            if (
              checkIfWithinDistance(
                position,
                bonePosition,
                SpellEffect.size[eid] + 50,
              )
            ) {
              addComponent(world, boneEntity, Dead);
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
          const necroEntities = query(
            world,
            [Necro, Position, Health],
            isNested,
          );
          for (const necroEid of necroEntities) {
            const necroPosition = getPositionFromEid(necroEid);

            if (
              checkIfWithinDistance(
                position,
                necroPosition,
                SpellEffect.size[eid] + 25,
              )
            ) {
              addComponent(world, necroEid, Damage);
              Damage.amount[necroEid] = 10;
            }
          }
          break;
      }

      removeComponent(world, eid, SpellEffect, ResolveSpell);
    }

    return world;
  };
};
