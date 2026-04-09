import { query, removeComponent } from "bitecs";
import { AttackCooldown, ExternalForce, SpellCooldown } from "../../components";
import { type World } from "../../types";

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

    for (const eid of query(world, [ExternalForce])) {
      ExternalForce.duration[eid] -= world.time.delta;
      if (ExternalForce.duration[eid] <= 0) {
        removeComponent(world, eid, ExternalForce);
      }
    }

    return world;
  };
};
