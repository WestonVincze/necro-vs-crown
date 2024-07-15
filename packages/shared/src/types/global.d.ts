import { World as IWorld } from "bitecs"

declare global {
  type World = IWorld & {
    time: {
      delta: number,
      elapsed: number,
      then: number
    }
  }

  export type World = World
}

export {};
