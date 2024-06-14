import { defineSystem, entityExists, hasComponent, removeEntity } from "bitecs";
import { bufferedOnDeath } from "../subjects";
import { createBonesEntity, createUnitEntity } from "../entities";
import { Necro, Position } from "../components";
import { Faction } from "../types";

export const createDeathSystem = (faction = Faction.Necro) => {
  return defineSystem(world => {
    bufferedOnDeath.subscribe(events => {
      for (const { eid } of events) {
        if (!entityExists(world, eid)) return;

        const x = Position.x[eid];
        const y = Position.y[eid];

        // "workaround" for testing Crown Solo mode
        if (hasComponent(world, Necro, eid)) {
          removeEntity(world, eid);
          return;
        }

        removeEntity(world, eid);

        if (faction === Faction.Necro) {
          // TODO: spawn loot based on unit's drop table
          createBonesEntity(world, x, y);
        } else {
          createUnitEntity(world, "Skeleton", x, y);
        }
      }
    })
    return world;
  })
}
