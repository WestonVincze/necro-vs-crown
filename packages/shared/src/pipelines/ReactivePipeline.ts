import { createAIEventsSystem, createItemEquipSystem } from "../systems";
import { type Pipeline } from "../types";
import { pipeline } from "./helpers";
import { PipelineFactory } from "./types";

/** DEPRECATED */
export const buildReactivePipeline = ({
  scene,
  pre = [],
  post = [],
}: PipelineFactory): Pipeline => {
  if (!scene) {
    console.error("Error: scene is required to build reactive pipeline.");
    return pipeline([]);
  }

  const coreReactiveSystems = [createAIEventsSystem(), createItemEquipSystem()];

  return pipeline([...pre, ...coreReactiveSystems, ...post]);
};
