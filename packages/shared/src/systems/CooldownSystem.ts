import { defineQuery, removeComponent } from "bitecs";
import { AttackCooldown, SpellCooldown } from "../components";

export const createCooldownSystem = () => {
  const attackCooldownQuery = defineQuery([AttackCooldown]);
  const spellCooldownQuery = defineQuery([SpellCooldown]);

  return (world: World) => {
    for (const eid of attackCooldownQuery(world)) {
      AttackCooldown.timeUntilReady[eid] -= world.time.delta;
      if (AttackCooldown.timeUntilReady[eid] <= 0) {
        removeComponent(world, AttackCooldown, eid);
      }
    }

    for (const eid of spellCooldownQuery(world)) {
      SpellCooldown.timeUntilReady[eid] -= world.time.delta;
      if (SpellCooldown.timeUntilReady[eid] <= 0) {
        removeComponent(world, SpellCooldown, eid);
      }
    }

    return world;
  };
};
