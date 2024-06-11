import { defineSystem, entityExists, removeEntity } from "bitecs";
import { onDeath } from "../subjects";
import { createBonesEntity } from "../entities";
import { Position } from "../components";

export const createDeathSystem = () => {
  return defineSystem(world => {
    onDeath.subscribe(({ eid }) => {
      if (!entityExists(world, eid)) return;

      const x = Position.x[eid];
      const y = Position.y[eid];
      removeEntity(world, eid);
      createBonesEntity(world, x, y);
    })
    return world;
  })
}
