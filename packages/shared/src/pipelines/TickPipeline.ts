import {
  createAssignFollowTargetSystem,
  createTargetingSystem,
} from "../systems";
import { pipeline } from "./helpers";

export const buildTickPipeline = () =>
  pipeline([createTargetingSystem(), createAssignFollowTargetSystem()]);
