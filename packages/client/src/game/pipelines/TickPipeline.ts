import {
  createAssignFollowTargetSystem,
  createTargetingSystem,
} from "@necro-crown/shared";
import { pipeline } from "./helpers";

export const buildTickPipeline = () =>
  pipeline([createTargetingSystem(), createAssignFollowTargetSystem()]);
