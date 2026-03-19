import { query, removeComponent } from "bitecs";
import { AttackCooldown, SpellCooldown } from "../../components";

export const createCooldownSystem = () => {
  return (world: World) => {
    for (const eid of query(world, [AttackCooldown])) {
      AttackCooldown.timeUntilReady[eid] -= world.time.delta;
      if (AttackCooldown.timeUntilReady[eid] <= 0) {
        removeComponent(world, eid, AttackCooldown);
      }
    }

    for (const eid of query(world, [SpellCooldown])) {
      SpellCooldown.timeUntilReady[eid] -= world.time.delta;
      if (SpellCooldown.timeUntilReady[eid] <= 0) {
        removeComponent(world, eid, SpellCooldown);
      }
    }

    return world;
  };
};
