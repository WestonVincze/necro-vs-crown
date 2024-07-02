import { defineSystem, entityExists, hasComponent, removeEntity, type World } from "bitecs";
import { bufferedOnDeath } from "../subjects";
import { createBonesEntity, createUnitEntity } from "../entities";
import { Necro, Position } from "../components";
import { Faction } from "../types";

export const createDeathSystem = (faction = Faction.Necro) => {
  return (world: World) => {
    bufferedOnDeath.subscribe(events => {
      for (const { eid } of events) {
        if (!entityExists(world, eid)) continue;

        const x = Position.x[eid];
        const y = Position.y[eid];

        removeEntity(world, eid);

        // WORKAROUND: for testing Crown Solo mode
        if (hasComponent(world, Necro, eid)) continue;

        if (faction === Faction.Necro) {
          // TODO: spawn loot based on unit's drop table
          createBonesEntity(world, x, y);
        } else {
          createUnitEntity(world, "Skeleton", x, y);
        }
      }
    })
    return world;
  }
}
