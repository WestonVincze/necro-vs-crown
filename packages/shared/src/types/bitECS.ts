import { type World as IWorld } from "bitecs";

export type Pipeline = (world: World) => void;

export interface World extends IWorld {
  time: {
    delta: number,
    elapsed: number,
    then: number
  }
}
