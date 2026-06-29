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
  Behavior,
  Behaviors,
  Faction,
} from "@necro-crown/shared";
import { createModelSystem } from "$game/systems/ModelSystem";
import { createInputHandlerSystem } from "$game/systems/InputHandlerSystem";
import { createThreeScene } from "./ThreeSetup";
import { initializeNecroThreeControls } from "./NecroThreeControls";

export const createThreeGame = (container: HTMLElement): (() => void) => {
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

  const physicsSystems = pipeline([
    createGridSystemNew(world),
    createInputHandlerSystem(),
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
    createDestroyAfterDelaySystem(),
    modelSystem,
    createDeathSystem(world, Faction.Necro),
  ]);

  const tickSystems = pipeline([
    createTargetingSystem(),
    createAssignFollowTargetSystem(),
  ]);

  createUnitEntity(world, UnitName.Necromancer, 0, 0);
  const skeletonPositions = [
    { x: -100, y: -100 },
    { x: 100, y: -120 },
    { x: -80, y: 100 },
  ];
  for (const pos of skeletonPositions) {
    const eid = createUnitEntity(world, UnitName.Skeleton, pos.x, pos.y);
    Behavior.type[eid] = Behaviors.FollowCursor;
  }
  createBonesEntity(world, 100, 100);

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
