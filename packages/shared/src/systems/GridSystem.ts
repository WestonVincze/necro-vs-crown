import { defineQuery, defineSystem } from "bitecs";
import { Position, GridCell } from "../components";

export const createGridSystem = () => {
  const gridQuery = defineQuery([Position, GridCell]);
  return defineSystem(world => {
    for (const eid of (gridQuery(world))) {
      GridCell.x[eid] = Math.floor((Position.x[eid] + 1536) / 64);
      GridCell.y[eid] = Math.floor((Position.y[eid] + 1152) / 64);
    }
    return world;
  })
}
