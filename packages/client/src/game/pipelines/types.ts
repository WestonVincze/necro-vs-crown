import type { System, World } from "@necro-crown/shared";
import { Scene } from "phaser";

export type Pipeline = (world: World) => void;

export type PipelineFactory = {
  world?: World;
  scene?: Scene;
  pre?: System[];
  post?: System[];
};
