import { type World as IWorld } from "./bitECS";
import { Grid } from "pathfinding";

declare global {
  export type World = IWorld;
}

export {};
