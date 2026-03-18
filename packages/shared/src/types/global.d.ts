import { type World as IWorld } from "bitecs";
import { Grid } from "pathfinding";

declare global {
  type World = IWorld & {
    time: {
      delta: number;
      elapsed: number;
      then: number;
    };
    grid: Grid;
  };

  export type World = World;
}

export {};
