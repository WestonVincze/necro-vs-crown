import { createWorld } from "bitecs";
import { Grid } from "pathfinding";
// const { Grid } = pkg;
import {
  createUnitEntity,
  UnitName,
  createDeathSystem,
  GameEvents,
  pipeline,
  updateWorldTime,
  createSeparationForceSystem,
  createMovementSystem,
  createCooldownSystem,
  createCombatSystem,
  createProjectileCollisionSystem,
  createSpellcastingSystem,
  createSpellEffectSystem,
  createStatUpdateSystem,
  createHealthSystem,
  createDestroyAfterDelaySystem,
  createGridSystemNew,
  createFollowTargetSystemNew,
  createTargetingSystem,
  createAssignFollowTargetSystem,
  MAP_WIDTH_TILES,
  MAP_HEIGHT_TILES,
  type World,
  createBonesEntity,
  Faction,
  createTargetSpawnerEntity,
  createUnitSpawnerSystem,
} from "@necro-crown/shared";
import { createModelSystem } from "$game/systems/ModelSystem";
import { createInputHandlerSystem } from "$game/systems/InputHandlerSystem";
import { createThreeScene } from "./ThreeSetup";
import { initializeNecroThreeControls } from "./NecroThreeControls";
import { createHealthBarSystem } from "./HealthBarSystem";
import { createHitSplatSystem } from "./HitSplatSystem";

import { modelBank } from "./ModelBank";

export const createThreeGame = async (
  container: HTMLElement,
): Promise<() => void> => {
  const ctx = createThreeScene(container);
  const { scene, camera, renderer, groundPlane, resize, dispose } = ctx;

  const world = createWorld() as World;
  world.time = { delta: 0, elapsed: 0, then: performance.now() };
  world.gameEvents = new GameEvents();
  world.networkType = "offline";
  world.unitUpgrades = {};
  world.experience = 0;

  const gridData: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      row.push(0);
    }
    gridData.push(row);
  }
  world.grid = new Grid(gridData);

  const modelSystem = createModelSystem(world, scene);

  await modelBank.ready;

  const physicsSystems = pipeline([
    createGridSystemNew(world),
    createInputHandlerSystem(),
    createUnitSpawnerSystem(),
    createFollowTargetSystemNew(world),
    createSeparationForceSystem(),
    createMovementSystem(),
    createCooldownSystem(),
    createCombatSystem(),
    createProjectileCollisionSystem(),
    createSpellcastingSystem(),
    createSpellEffectSystem(world),
    createStatUpdateSystem(),
    createHealthSystem(),
    createHealthBarSystem(world, scene),
    createHitSplatSystem(world, scene),
    createDestroyAfterDelaySystem(),
    modelSystem,
    createDeathSystem(world, Faction.Necro),
  ]);

  const tickSystems = pipeline([
    createTargetingSystem(),
    createAssignFollowTargetSystem(),
  ]);

  const necro = createUnitEntity(world, UnitName.Necromancer, 0, 0);
  createTargetSpawnerEntity(world, necro);

  const bonePositions = [
    { x: -100, y: -100 },
    { x: 100, y: -120 },
    { x: -80, y: 100 },
  ];

  for (const pos of bonePositions) {
    createBonesEntity(world, pos.x, pos.y);
  }

  const disposeControls = initializeNecroThreeControls(
    renderer.domElement,
    camera,
    groundPlane,
    world,
  );

  let animFrameId: number;
  let timeSinceLastTick = 0;

  const animate = () => {
    animFrameId = requestAnimationFrame(animate);

    updateWorldTime(world);

    timeSinceLastTick += world.time.delta;

    if (timeSinceLastTick > 200) {
      tickSystems(world);
      timeSinceLastTick = 0;
    }

    physicsSystems(world);

    renderer.render(scene, camera);
  };

  animFrameId = requestAnimationFrame(animate);

  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(animFrameId);
    disposeControls();
    window.removeEventListener("resize", resize);
    dispose();
  };
};
