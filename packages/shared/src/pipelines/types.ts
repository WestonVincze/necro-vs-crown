import { System } from "$types";
import { Scene } from "phaser";

export type PipelineFactory = {
  scene?: Scene;
  pre?: System[];
  post?: System[];
};
