import {
  createCombatSystem,
  createCooldownSystem,
  createDestroyAfterDelaySystem,
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
  createStatUpdateSystem,
  createTimeSystem,
  createUnitSpawnerSystem,
  createUpgradeSelectionSystem,
} from "@necro-crown/shared";
import {
  createSpriteSystem,
  createDrawCollisionSystem,
  createDrawSpellEffectSystem,
} from "$game/systems";
import type { Pipeline, PipelineFactory } from "./types";
import { pipeline } from "./helpers";

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
