import {
  createCombatSystem,
  createCooldownSystem,
  createDeathSystem,
  createDestroyAfterDelaySystem,
  createDrawCollisionSystem,
  createDrawSpellEffectSystem,
  createEmitUpgradeRequestEventSystem,
  createHandleUpgradeSelectEventSystem,
  createHealthBarSystem,
  createHealthSystem,
  createLevelUpSystem,
  createMovementSystem,
  createProjectileCollisionSystem,
  createSeparationForceSystem,
  createSpellcastingSystem,
  createSpellEffectSystem,
  createSpriteSystem,
  createStatUpdateSystem,
  createTimeSystem,
  createUnitSpawnerSystem,
  createUpgradeSelectionSystem,
} from "$systems";
import { type Pipeline } from "$types";

import { pipeline } from "./helpers";
import { PipelineFactory } from "./types";

export const buildPhysicsPipeline = ({
  scene,
  pre = [],
  post = [],
}: PipelineFactory): Pipeline => {
  if (!scene) {
    console.error("Error: scene is required to build physics pipeline.");
    return pipeline([]);
  }

  const corePhysicsSystems = [
    createEmitUpgradeRequestEventSystem(),
    createUpgradeSelectionSystem(),
    createHandleUpgradeSelectEventSystem(), // subscribes to game events...
    createLevelUpSystem(),
    createUnitSpawnerSystem(),
    createDrawCollisionSystem(scene),
    createSeparationForceSystem(),
    createMovementSystem(),
    createSpriteSystem(scene),
    // createFollowTargetSystem(scene),
    createCooldownSystem(),
    createCombatSystem(),
    // createCollisionSystem(),
    createProjectileCollisionSystem(),
    createSpellcastingSystem(),
    createSpellEffectSystem(),
    createDrawSpellEffectSystem(scene),
    createStatUpdateSystem(),
    createHealthSystem(),
    createHealthBarSystem(scene),
    createDestroyAfterDelaySystem(),
    createDeathSystem(),
  ];
  return pipeline([
    ...pre,
    ...corePhysicsSystems,
    ...post,
    createTimeSystem(), // time should always be last
  ]);
};
