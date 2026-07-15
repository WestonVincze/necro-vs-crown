import { addComponent, addEntity, createWorld } from "bitecs";
import { Grid } from "pathfinding";
import { hasComponent } from "bitecs";
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
  Position,
  SpellEffect,
  SpellName,
  SpriteTexture,
  Velocity,
} from "@necro-crown/shared";
import { createModelSystem, type Entry } from "$game/systems/ModelSystem";
import { createInputHandlerSystem } from "$game/systems/InputHandlerSystem";
import { createThreeScene } from "./ThreeSetup";
import { initializeNecroThreeControls } from "./NecroThreeControls";
import { initializeCrownThreeControls } from "./CrownThreeControls";
import { crownClientState } from "$game/Crown";
import { createHealthBarSystem } from "./HealthBarSystem";
import { createHitSplatSystem } from "./HitSplatSystem";
import { createDrawSpellEffectSystem } from "./DrawSpellEffectSystem";
import { createDevToolsPanel } from "$game/devtools/createDevToolsPanel";
import { createGodModeSystem } from "$game/devtools/createGodModeSystem";
import { modelBank } from "./ModelBank";
import {
  AnimatorStore,
  ActionState,
  ActionKind,
  CastPhase,
  registerSpell,
  type Intent,
} from "$game/animation";

export const createThreeGame = async (
  container: HTMLElement,
  faction: Faction = Faction.Necro,
): Promise<() => void> => {
  const ctx = createThreeScene(container);
  const { scene, camera, renderer, groundPlane, resize, dispose } = ctx;

  const world = createWorld() as World;
  world.time = { delta: 0, elapsed: 0, then: performance.now() };
  world.gameEvents = new GameEvents();
  world.networkType = "offline";
  world.unitUpgrades = {};
  world.experience = 0;
  world.paused = false;

  const gridData: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
      row.push(0);
    }
    gridData.push(row);
  }
  world.grid = new Grid(gridData);

  await modelBank.ready;

  const animStore = new AnimatorStore();

  modelBank.forEach((textureId, data) => {
    const key = SpriteTexture[textureId]!;
    animStore.registerArchetype(key, data.animations);
  });

  for (const name of Object.values(SpellName).filter(
    (v): v is string => typeof v === "string",
  )) {
    registerSpell(name.toLowerCase());
  }

  const modelSystem = createModelSystem(world, scene, animStore);

  let getGodMode: () => boolean = () => false;

  const animQuery = (): number[] => {
    const result: number[] = [];
    for (const [eid, entry] of modelSystem.entries) {
      if (entry.type === "model" && animStore.get(eid)) result.push(eid);
    }
    return result;
  };

  const animSystem = (world: World) => {
    const dt = world.time.delta / 1000;
    for (const eid of animQuery()) {
      let intent: Intent;
      if (hasComponent(world, eid, SpellEffect)) {
        const spellName = SpellName[SpellEffect.name[eid] as SpellName] ?? "";
        intent = {
          kind: ActionKind.Casting,
          spell: spellName,
          phase: CastPhase.Hold,
        };
      } else {
        const speedSq = Velocity.x[eid] ** 2 + Velocity.y[eid] ** 2;
        intent =
          speedSq > 1e-4
            ? { kind: ActionKind.Moving }
            : { kind: ActionKind.Idle };
      }
      const animator = animStore.get(eid)!;
      animator.update(intent, dt);
      ActionState.kind[eid] = intent.kind;
    }
    return world;
  };

  const physicsSystems = pipeline([
    createGridSystemNew(world),
    ...(faction === Faction.Necro ? [createInputHandlerSystem()] : []),
    createUnitSpawnerSystem(),
    createFollowTargetSystemNew(world),
    createSeparationForceSystem(),
    createMovementSystem(),
    createCooldownSystem(),
    createCombatSystem(),
    createProjectileCollisionSystem(),
    createSpellcastingSystem(),
    createSpellEffectSystem(world),
    createDrawSpellEffectSystem(world, scene),
    createStatUpdateSystem(),
    createHealthSystem(),
    createGodModeSystem(world, () => getGodMode()),
    createHealthBarSystem(world, scene),
    createHitSplatSystem(world, scene),
    createDestroyAfterDelaySystem(),
    modelSystem.run,
    animSystem,
    createDeathSystem(world, faction),
  ]);

  const tickSystems = pipeline([
    createTargetingSystem(),
    createAssignFollowTargetSystem(),
  ]);

  let playerEid: number;
  let disposeControls: () => void;
  let crownState: CrownStateStore | null = null;

  if (faction === Faction.Necro) {
    playerEid = createUnitEntity(world, UnitName.Necromancer, 0, 0);

    const bonePositions = [
      { x: -100, y: -100 },
      { x: 100, y: -120 },
      { x: -80, y: 100 },
    ];
    for (const pos of bonePositions) {
      createBonesEntity(world, pos.x, pos.y);
    }

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
        console.log("playing card");
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

  let animFrameId: number;
  let timeSinceLastTick = 0;
  let wasPaused = false;

  const updateInspector = () => {
    const inspector = devTools.inspectorState;
    let entry: Entry | undefined = modelSystem.entries.get(
      inspector.selectedEid,
    );
    if (!entry && modelSystem.entries.size > 0) {
      entry = modelSystem.entries.values().next().value;
      if (entry) inspector.selectedEid = entry.eid;
    }
    if (entry) {
      inspector.hasModel = entry.type === "model";
      if (entry.type === "model") {
        const anim = animStore.get(entry.eid);
        const kind = ActionState.kind[entry.eid];
        inspector.animState =
          kind !== undefined
            ? (ActionKind[kind as ActionKind] ?? "unknown")
            : "N/A";
        inspector.currentAnim = anim?.currentClip ?? "(none)";
        inspector.posX = Math.round(entry.group.position.x);
        inspector.posY = Math.round(entry.group.position.z);
      } else {
        inspector.animState = "N/A";
        inspector.currentAnim = "N/A";
        inspector.posX = Math.round(entry.mesh.position.x);
        inspector.posY = Math.round(entry.mesh.position.z);
      }
    } else {
      inspector.hasModel = false;
      inspector.animState = "N/A";
      inspector.currentAnim = "N/A";
      inspector.posX = 0;
      inspector.posY = 0;
    }
  };

  const followPlayer = () => {
    if (faction !== Faction.Necro) return;
    const px = Position.x[playerEid];
    const py = Position.y[playerEid];
    camera.position.set(px, 1000, py + 1000);
    camera.lookAt(px, 0, py);
  };

  const stepFrame = () => {
    world.time.then = performance.now() - 16;
    updateWorldTime(world);
    physicsSystems(world);
    updateInspector();
    followPlayer();
    renderer.render(scene, camera);
  };

  const stepTick = () => {
    tickSystems(world);
  };

  const animate = () => {
    animFrameId = requestAnimationFrame(animate);

    if (world.paused) {
      wasPaused = true;
      return;
    }

    if (wasPaused) {
      world.time.then = performance.now();
      wasPaused = false;
    }

    updateWorldTime(world);

    timeSinceLastTick += world.time.delta;

    if (timeSinceLastTick > 200) {
      tickSystems(world);
      timeSinceLastTick = 0;
    }

    physicsSystems(world);
    updateInspector();

    followPlayer();

    renderer.render(scene, camera);
  };

  animFrameId = requestAnimationFrame(animate);

  window.addEventListener("resize", resize);

  const devTools = createDevToolsPanel({
    world,
    camera,
    onStepFrame: stepFrame,
    onStepTick: stepTick,
  });
  getGodMode = () => devTools.state.godMode;

  return () => {
    cancelAnimationFrame(animFrameId);
    devTools.destroy();
    disposeControls();
    crownState?.destroy();
    window.removeEventListener("resize", resize);
    dispose();
  };
};
