import { Scene } from "phaser";

export type System = (world: World) => World;

export type PipelineFactory = {
  scene?: Scene;
  pre?: System[];
  post?: System[];
};
