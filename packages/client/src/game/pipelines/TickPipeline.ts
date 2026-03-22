import {
  createAssignFollowTargetSystem,
  createTargetingSystem,
  pipeline,
} from "@necro-crown/shared";

export const buildTickPipeline = () =>
  pipeline([createTargetingSystem(), createAssignFollowTargetSystem()]);
