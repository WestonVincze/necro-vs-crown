import { defineSystem, entityExists, removeEntity } from "bitecs";
import { bufferedOnDeath } from "../subjects";
import { createBonesEntity } from "../entities";
import { Position } from "../components";

export const createDeathSystem = () => {
  return defineSystem(world => {
    bufferedOnDeath.subscribe(events => {
      for (const { eid } of events) {
        if (!entityExists(world, eid)) return;
        console.log("MAKE THE BONES")

        const x = Position.x[eid];
        const y = Position.y[eid];
        removeEntity(world, eid);
        createBonesEntity(world, x, y);
      }
    })
    return world;
  })
}
