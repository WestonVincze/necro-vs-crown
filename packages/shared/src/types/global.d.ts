import { type World as IWorld } from "bitecs";

declare global {
  export type World = IWorld & {
    time: {
      delta: number,
      elapsed: number,
      then: number
    }
  }
}

export {};
