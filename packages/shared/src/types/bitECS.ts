import { World as IWorld } from "bitecs";

export type Pipeline = (world: World) => void;

export type World = IWorld & {
  time: {
    delta: number;
    elapsed: number;
    then: number;
  };
};
