import { addComponent, addEntity, defineQuery, defineSystem, enterQuery, exitQuery, removeEntity } from "bitecs";
import { Spell, Input, SpellEffect, Position, SpellState } from "../components";
import { GameObjects, Scene } from "phaser";

export const createSpellcastingSystem = () => {
  const spellcasterQuery = defineQuery([Input, Position, Spell]);

  const sEnterQuery = enterQuery(spellcasterQuery);
  const sExitQuery = exitQuery(spellcasterQuery);

  return defineSystem(world => {
    const entitiesEntered = sEnterQuery(world);
    // for (let i = 0; i < entitiesEntered.length; i++) {}

    const entities = spellcasterQuery(world);
    for (let i = 0; i < entities.length; i++) {
      // track spell as it's being casted
      const casterEid = entities[i];
      if (Input.castingSpell[casterEid] === 0) {
        // TODO: enforce accurate state check (SpellState should not be ready just because the Input stopped)
        Spell.state[casterEid] = SpellState.Ready;
        continue;
      }

      const spellState = Spell.state[casterEid] as SpellState;
      switch (spellState) {
        case SpellState.Ready:
          Spell.state[casterEid] = SpellState.Casting;
          const spellEffectEid = addEntity(world);
          addComponent(world, SpellEffect, spellEffectEid);
          addComponent(world, Position, spellEffectEid);

          SpellEffect.anchor[spellEffectEid] = casterEid;
          SpellEffect.size[spellEffectEid] = 30;
          SpellEffect.maxSize[spellEffectEid] = 100;
          SpellEffect.growthRate[spellEffectEid] = 1;

          /*
          Position.x[spellEffectEid] = Position.x[casterEid];
          Position.x[spellEffectEid] = Position.x[casterEid];
          */
          break;
        case SpellState.Casting:
          break;
        default:
          break;
      }
    }

    const entitiesExited = sExitQuery(world);
    /*
    for (let i = 0; i < entitiesExited.length; i++) {
      // try to resolve spell
    }
    */

    return world;
  })
}

// TODO: abstract the client (Phaser related) logic into separate system
export const createDrawSpellEffectSystem = (scene: Scene) => {
  // TODO: make this compatible with other shapes and sprites
  const circlesById = new Map<number, GameObjects.Arc>();

  const spellEffectQuery = defineQuery([SpellEffect, Position]);
  const onEnterQuery = enterQuery(spellEffectQuery);
  const onExitQuery = exitQuery(spellEffectQuery);

  return defineSystem(world => {
    const entitiesEntered = onEnterQuery(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const eid = entitiesEntered[i];

      const anchorEid = SpellEffect.anchor[eid];

      const x = Position.x[anchorEid];
      const y = Position.y[anchorEid];

      const circle = scene.add.circle(x, y, SpellEffect.size[eid], 0xc360eb, 0.5);
      circlesById.set(eid, circle);
    }

    const entities = spellEffectQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const anchorEid = SpellEffect.anchor[eid];

      // TODO: refactor to a more sensible solution
      if (Input.castingSpell[anchorEid] !== 1) {
        removeEntity(world, eid);
        continue;
      }
      /*
      if (SpellEffect.duration[eid] <=0) {

      }
      */

      // set position to position of anchor
      Position.x[eid] = Position.x[anchorEid];
      Position.y[eid] = Position.y[anchorEid];


      // grow spell effect
      if (SpellEffect.size[eid] < SpellEffect.maxSize[eid]) {
        SpellEffect.size[eid] += Math.min(SpellEffect.maxSize[eid], SpellEffect.growthRate[eid]);
      }

      const circle = circlesById.get(eid);
      if (!circle) {
        console.warn(`Circle not found: Unable to modify spellEffect for ${eid}`);
        continue;
      }

      circle.setPosition(Position.x[eid], Position.y[eid]);
      circle.radius = SpellEffect.size[eid];
    }

    const entitiesExited = onExitQuery(world);

    for (let i = 0; i < entitiesExited.length; i++) {
      const eid = entitiesExited[i];

      const circle = circlesById.get(eid);

      if (!circle) {
        console.warn(`Circle not found: Unable to delete circle for ${eid}`);
      } else {
        circle.destroy();
      }

      circlesById.delete(eid);

    }
    return world;
  })

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
