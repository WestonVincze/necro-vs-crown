import { addComponent, addEntity } from "bitecs";
import {
  createUnitEntity,
  UnitName,
  Behavior,
  Behaviors,
  Player,
  Level,
  Coin,
  CoinAccumulator,
  BASE_EXP,
  CrownStateStore,
  generateMockCards,
  createDeathSystem,
  createUnitSpawnerSystem,
  createFollowTargetSystemNew,
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
  createTargetingSystem,
  createAssignFollowTargetSystem,
  createBonesEntity,
  Faction,
  type World,
  createTargetSpawnerEntity,
} from "@necro-crown/shared";
import { createInputHandlerSystem } from "$game/systems/InputHandlerSystem";
import {
  createCameraFollowSystem,
  createCameraFollowEntity,
} from "$game/systems/CameraFollowSystem";
import { createThreeScene } from "./ThreeSetup";
import { initializeNecroThreeControls } from "./NecroThreeControls";
import { initializeCrownThreeControls } from "./CrownThreeControls";
import { crownClientState } from "$game/Crown";
import { createGodModeSystem } from "$game/devtools/createGodModeSystem";
import { createDevToolsPanel } from "$game/devtools/createDevToolsPanel";
import {
  createBaseWorld,
  initAnimationSystems,
  createRenderSystems,
  startGameLoop,
  updateInspector,
  type AnimSystemBundle,
  type GameLoop,
} from "./createThreeGameBase";

export const createThreeGame = async (
  container: HTMLElement,
  faction: Faction = Faction.Necro,
): Promise<() => void> => {
  const ctx = createThreeScene(container);
  const { scene, camera, renderer, groundPlane, resize, dispose } = ctx;

  const world = createBaseWorld();
  world.networkType = "offline";

  const animBundle: AnimSystemBundle = await initAnimationSystems(world, scene);

  const renderSystems = createRenderSystems(world, scene, animBundle);

  let getGodMode: () => boolean = () => false;

  // --- pre-create all system closures (called once) ---
  const gridSystem = createGridSystemNew(world);
  const inputHandler =
    faction === Faction.Necro ? createInputHandlerSystem() : null;
  const unitSpawner = createUnitSpawnerSystem();
  const followTarget = createFollowTargetSystemNew(world);
  const separationForce = createSeparationForceSystem();
  const movement = createMovementSystem();
  const cooldown = createCooldownSystem();
  const combat = createCombatSystem();
  const projectileCollision = createProjectileCollisionSystem();
  const spellcasting = createSpellcastingSystem();
  const spellEffect = createSpellEffectSystem(world);
  const statUpdate = createStatUpdateSystem();
  const health = createHealthSystem();
  const godMode = createGodModeSystem(world, () => getGodMode());
  const destroyAfterDelay = createDestroyAfterDelaySystem();
  const death = createDeathSystem(world, faction);
  const cameraFollow = createCameraFollowSystem(camera);
  const targeting = createTargetingSystem();
  const assignFollowTarget = createAssignFollowTargetSystem();

  const physicsSystems = (w: World) => {
    gridSystem(w);
    if (inputHandler) inputHandler(w);
    unitSpawner(w);
    followTarget(w);
    separationForce(w);
    movement(w);
    cooldown(w);
    combat(w);
    projectileCollision(w);
    spellcasting(w);
    spellEffect(w);
    statUpdate(w);
    health(w);
    godMode(w);
    destroyAfterDelay(w);
    renderSystems(w);
    death(w);
    cameraFollow(w);
    return w;
  };

  const tickSystems = (w: World) => {
    targeting(w);
    assignFollowTarget(w);
    return w;
  };

  let playerEid: number;
  let cameraEid: number | undefined;
  let disposeControls: () => void;
  let crownState: CrownStateStore | null = null;

  if (faction === Faction.Necro) {
    playerEid = createUnitEntity(world, UnitName.Necromancer, 0, 0);
    cameraEid = createCameraFollowEntity(world, playerEid);

    const bonePositions = [
      { x: -100, y: -100 },
      { x: 100, y: -120 },
      { x: -80, y: 100 },
    ];
    for (const pos of bonePositions) {
      createBonesEntity(world, pos.x, pos.y);
    }

    createTargetSpawnerEntity(world, playerEid);

    disposeControls = initializeNecroThreeControls(
      renderer.domElement,
      camera,
      groundPlane,
      world,
    );
  } else {
    playerEid = addEntity(world);
    addComponent(world, playerEid, Player);
    addComponent(world, playerEid, Level);
    Level.currentLevel[playerEid] = 0;
    Level.currentExp[playerEid] = 0;
    Level.expToNextLevel[playerEid] = BASE_EXP;
    addComponent(world, playerEid, Coin);
    addComponent(world, playerEid, CoinAccumulator);
    Coin.current[playerEid] = 0;
    Coin.max[playerEid] = 10;
    CoinAccumulator.amount[playerEid] = 1;
    CoinAccumulator.frequency[playerEid] = 1000;

    for (let i = 0; i < 5; i++) {
      const eid = createUnitEntity(
        world,
        UnitName.Skeleton,
        Math.random() * 750,
        Math.random() * 750,
      );
      addComponent(world, eid, Behavior);
      Behavior.type[eid] = Behaviors.AutoTarget;
    }

    crownState = new CrownStateStore();
    crownState.start();
    crownState.hand$.subscribe((hand) =>
      crownClientState.applyHandUpdate(hand),
    );
    crownState.discard$.subscribe((discard) =>
      crownClientState.applyDiscardUpdate(discard),
    );
    crownState.coins$.subscribe((coins) =>
      crownClientState.applyCoinsUpdate(coins),
    );
    crownState.addCards(generateMockCards(8));
    crownState.drawCard();
    crownState.drawCard();
    crownState.drawCard();
    crownState.drawCard();

    disposeControls = initializeCrownThreeControls(
      renderer.domElement,
      camera,
      groundPlane,
      (x, y) => {
        const selected = crownClientState.getSelectedCard();
        if (crownState && selected && selected.id !== undefined) {
          crownState.playCard(selected.id, (name) =>
            createUnitEntity(world, name, x, y),
          );
          crownClientState.deselectCard();
        }
      },
      scene,
    );
  }

  let loop!: GameLoop;

  const devTools = createDevToolsPanel({
    world,
    camera,
    onStepFrame: () => loop.stepFrame(),
    onStepTick: () => loop.stepTick(),
  });
  getGodMode = () => devTools.state.godMode;

  loop = startGameLoop({
    world,
    renderer,
    scene,
    camera,
    simulate: physicsSystems,
    tick: tickSystems,
    onBeforeRender: () => {
      const info = updateInspector(
        animBundle,
        devTools.inspectorState.selectedEid,
      );
      Object.assign(devTools.inspectorState, info);
    },
  });

  window.addEventListener("resize", resize);

  return () => {
    loop.stop();
    devTools.destroy();
    disposeControls();
    crownState?.destroy();
    window.removeEventListener("resize", resize);
    dispose();
  };
};
