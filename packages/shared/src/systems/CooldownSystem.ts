import { defineQuery, defineSystem, removeComponent } from "bitecs";
import { type World } from "../types";
import { AttackCooldown } from "../components";

export const createCooldownSystem = () => {
  const attackCooldownQuery = defineQuery([AttackCooldown])

  return (world: World) => {
    for (const eid of attackCooldownQuery(world)) {
      if (AttackCooldown.attackReady[eid] <= world.time.elapsed) {
        removeComponent(world, AttackCooldown, eid);
      }
    }

    return world;
  }
}
