import { World as IWorld } from "bitecs";
import { Grid } from "pathfinding";
import { GameEvents } from "../events/GameEvents";

export type Pipeline = (world: World) => void;

export type System = (world: World) => World;

export type World = IWorld & {
  time: {
    delta: number;
    elapsed: number;
    then: number;
  };
  grid: Grid;
  gameEvents: GameEvents;
};
