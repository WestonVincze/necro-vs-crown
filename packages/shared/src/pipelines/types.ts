import type { System, World } from "../types";
import { Scene } from "phaser";

export type PipelineFactory = {
  world?: World;
  scene?: Scene;
  pre?: System[];
  post?: System[];
};
