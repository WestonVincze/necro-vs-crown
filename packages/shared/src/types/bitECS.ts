import { World as IWorld } from "bitecs";
import { Grid } from "pathfinding";
import { GameEvents } from "../events/GameEvents";
import { NetworkType } from "./units";
import { StatOverrides } from "./gameSettings";

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
  networkType: NetworkType;
  unitUpgrades: StatOverrides;
  experience: number;
  paused?: boolean;
};
