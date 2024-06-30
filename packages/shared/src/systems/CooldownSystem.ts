import { defineQuery, removeComponent } from "bitecs";
import { type World } from "../types";
import { AttackCooldown, SpellCooldown } from "../components";

export const createCooldownSystem = () => {
  const attackCooldownQuery = defineQuery([AttackCooldown]);
  const spellCooldownQuery = defineQuery([SpellCooldown]);

  return (world: World) => {
    for (const eid of attackCooldownQuery(world)) {
      if (AttackCooldown.ready[eid] <= world.time.elapsed) {
        removeComponent(world, AttackCooldown, eid);
      }
    }

    for (const eid of spellCooldownQuery(world)) {
      if (SpellCooldown.ready[eid] <= world.time.elapsed) {
        removeComponent(world, SpellCooldown, eid);
      }
    }

    return world;
  }
}
