import {
  createCombatSystem,
  createCooldownSystem,
  createDestroyAfterDelaySystem,
  createDrawCollisionSystem,
  createDrawSpellEffectSystem,
  createEmitUpgradeRequestEventSystem,
  createHandleUpgradeSelectEventSystem,
  createHealthBarSystem,
  createHealthSystem,
  createHitSplatSystem,
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
} from "../systems";
import { type Pipeline } from "../types";

import { pipeline } from "./helpers";
import { PipelineFactory } from "./types";

export const buildPhysicsPipeline = ({
  world,
  scene,
  pre = [],
  post = [],
}: PipelineFactory): Pipeline => {
  if (!scene || !world) {
    console.error(
      "Error: scene and world are required to build physics pipeline.",
    );
    return pipeline([]);
  }

  const corePhysicsSystems = [
    createEmitUpgradeRequestEventSystem(world),
    createUpgradeSelectionSystem(),
    createHandleUpgradeSelectEventSystem(), // subscribes to game events...
    createLevelUpSystem(),
    createUnitSpawnerSystem(),
    createDrawCollisionSystem(world, scene),
    createSeparationForceSystem(),
    createMovementSystem(),
    createSpriteSystem(world, scene),
    // createFollowTargetSystem(scene),
    createCooldownSystem(),
    createCombatSystem(),
    // createCollisionSystem(),
    createProjectileCollisionSystem(),
    createSpellcastingSystem(),
    createSpellEffectSystem(world),
    createDrawSpellEffectSystem(world, scene),
    createStatUpdateSystem(),
    createHealthSystem(),
    createHitSplatSystem(world, scene),
    createHealthBarSystem(world, scene),
    createDestroyAfterDelaySystem(),
  ];
  return pipeline([
    ...pre,
    ...corePhysicsSystems,
    ...post,
    createTimeSystem(), // time should always be last
  ]);
};
