import { type Room } from "@colyseus/sdk";
import {
  createObserverDeserializer,
  createSnapshotDeserializer,
  createSoADeserializer,
} from "bitecs/serialization";
import { fromEvent, map, merge, Subscription, switchMap, take } from "rxjs";
import { distinctUntilChanged } from "rxjs";
import { query } from "bitecs";
import * as THREE from "three";
import {
  Faction,
  GameEvents,
  Networked,
  Player,
  Necro,
  createHealthSystem,
  networkSyncComponents,
  type HitSplatEvent,
  type GameOverEvent,
  updateWorldTime,
  type World,
} from "@necro-crown/shared";
import { createThreeScene } from "./ThreeSetup";
import { initializeCrownThreeControls } from "./CrownThreeControls";
import { crownClientState } from "$game/Crown";
import { createDevToolsPanel } from "$game/devtools/createDevToolsPanel";
import {
  gameOver,
  isPaused,
  pendingUpgrade,
} from "../../stores/GameEventStore";
import {
  createBaseWorld,
  initAnimationSystems,
  createRenderSystems,
  updateInspector,
  type AnimSystemBundle,
} from "./createThreeGameBase";
import {
  createCameraFollowSystem,
  createCameraFollowEntity,
  setCameraTarget,
} from "$game/systems/CameraFollowSystem";

const createInputState = () => {
  const held = new Set<string>();

  function computeState() {
    return {
      moveX: (held.has("d") ? 1 : 0) - (held.has("a") ? 1 : 0),
      moveY: (held.has("s") ? 1 : 0) - (held.has("w") ? 1 : 0),
      castingSpell: held.has(" "),
    };
  }

  const keydown$ = fromEvent<KeyboardEvent>(window, "keydown").pipe(
    map((e) => {
      held.add(e.key);
      return computeState();
    }),
  );

  const keyup$ = fromEvent<KeyboardEvent>(window, "keyup").pipe(
    map((e) => {
      held.delete(e.key);
      return computeState();
    }),
  );

  return merge(keydown$, keyup$).pipe(
    distinctUntilChanged(
      (a, b) =>
        a.moveX === b.moveX &&
        a.moveY === b.moveY &&
        a.castingSpell === b.castingSpell,
    ),
  );
};

const createNecroNetworkControls = (
  canvas: HTMLCanvasElement,
  camera: THREE.OrthographicCamera,
  groundPlane: THREE.Plane,
  sendWaypoint: (x: number, y: number) => void,
  sendInputs: (inputs: {
    moveX: number;
    moveY: number;
    castingSpell: boolean;
  }) => void,
): (() => void) => {
  const cleanup: (() => void)[] = [];
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const target = new THREE.Vector3();

  const getGroundPoint = (
    clientX: number,
    clientY: number,
  ): THREE.Vector3 | null => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.ray.intersectPlane(groundPlane, target);
    return hit ? target.clone() : null;
  };

  const pointerDown$ = fromEvent<PointerEvent>(canvas, "pointerdown");
  const pointerUp$ = fromEvent<PointerEvent>(canvas, "pointerup");

  const tapThresholdMs = 300;
  const tapMoveThresholdPx = 25;

  const pointerSub: Subscription = pointerDown$
    .pipe(
      switchMap((down) => {
        const startX = down.clientX;
        const startY = down.clientY;
        const startTime = Date.now();
        return pointerUp$.pipe(
          take(1),
          map((up) => ({ up, startX, startY, startTime })),
        );
      }),
    )
    .subscribe(({ up, startX, startY, startTime }) => {
      const dt = Date.now() - startTime;
      const dx = up.clientX - startX;
      const dy = up.clientY - startY;
      const moved = Math.hypot(dx, dy);

      if (dt <= tapThresholdMs && moved <= tapMoveThresholdPx) {
        const pt = getGroundPoint(up.clientX, up.clientY);
        if (pt) sendWaypoint(pt.x, pt.z);
      }
    });

  cleanup.push(() => pointerSub.unsubscribe());

  const inputsSub = createInputState().subscribe((inputs) => {
    sendInputs(inputs);
  });
  cleanup.push(() => inputsSub.unsubscribe());

  return () => {
    for (const fn of cleanup) fn();
  };
};

export const createThreeVersusGame = async (
  container: HTMLElement,
  room: Room,
  faction: Faction,
): Promise<() => void> => {
  const ctx = createThreeScene(container);
  const { scene, camera, renderer, groundPlane, resize, dispose } = ctx;

  const world = createBaseWorld();
  world.networkType = "networked";
  world.gameEvents = new GameEvents();

  const animBundle: AnimSystemBundle = await initAnimationSystems(world, scene);

  const healthSystem = createHealthSystem();
  const renderSystems = createRenderSystems(world, scene, animBundle);
  const cameraFollowSystem = createCameraFollowSystem(camera);

  const cameraEid = createCameraFollowEntity(world, 0);

  const versusSystems = (w: World) => {
    healthSystem(w);
    renderSystems(w);
    cameraFollowSystem(w);
    return w;
  };

  // --- network deserializers ---
  const idMap = new Map<number, number>();

  const snapshotDeserialize = createSnapshotDeserializer(
    world,
    networkSyncComponents,
  );
  const observerDeserialize = createObserverDeserializer(
    world,
    Networked,
    networkSyncComponents,
  );
  const soaDeserialize = createSoADeserializer(networkSyncComponents);

  // --- room message handlers ---
  let snapshotCount = 0;
  room.onMessage("snapshot", (data: ArrayBuffer) => {
    const view = new Uint8Array(data);
    snapshotDeserialize(view.buffer, idMap);
    snapshotCount++;
    if (snapshotCount === 1 && faction === Faction.Necro) {
      for (const eid of query(world, [Player, Necro])) {
        setCameraTarget(cameraEid, eid);
        break;
      }
    }
  });

  room.onMessage("soaUpdates", (data: ArrayBuffer) => {
    const view = new Uint8Array(data);
    soaDeserialize(view.buffer, idMap);
  });

  room.onMessage("observerUpdates", (data: ArrayBuffer) => {
    const view = new Uint8Array(data);
    observerDeserialize(view.buffer, idMap);
  });

  room.onMessage("upgrade:start", (upgradeData: any) => {
    isPaused.set(true);
    const options =
      faction === Faction.Necro
        ? upgradeData.necroOptions
        : upgradeData.crownOptions;
    pendingUpgrade.set({
      options,
      duration: upgradeData.duration,
      onSelect: (optionId: string) => {
        room.send("upgrade:selected", { optionId });
        pendingUpgrade.set(null);
      },
    });
  });

  room.onMessage("upgrade:complete", () => {
    world.paused = false;
    isPaused.set(false);
    pendingUpgrade.set(null);
  });

  room.onMessage("hitsplat", (e: HitSplatEvent) => {
    world.gameEvents.hitSplat$.next(e);
  });

  room.onMessage("gameOver", (e: GameOverEvent) => {
    gameOver.set(e);
  });

  // --- faction-specific setup ---
  let disposeControls: () => void;

  if (faction === Faction.Necro) {
    disposeControls = createNecroNetworkControls(
      renderer.domElement,
      camera,
      groundPlane,
      (x, y) => room.send("set_cursor_waypoint", { x, y }),
      (inputs) => room.send("key_inputs", inputs),
    );
  } else {
    disposeControls = initializeCrownThreeControls(
      renderer.domElement,
      camera,
      groundPlane,
      (x, y) => {
        const selected = crownClientState.getSelectedCard();
        if (selected && selected.id !== undefined) {
          room.send("play_card", { id: selected.id, xPos: x, yPos: y });
          crownClientState.deselectCard();
        }
      },
      scene,
    );
    room.onMessage("hand:update", ({ hand }: { hand: any }) => {
      crownClientState.applyHandUpdate(hand);
    });
    room.onMessage("discard:update", ({ discard }: { discard: any }) => {
      crownClientState.applyDiscardUpdate(discard);
    });
    room.onMessage("coins:update", ({ coins }: { coins: number }) => {
      crownClientState.applyCoinsUpdate(coins);
    });
  }

  room.send("loaded");

  // --- dev tools ---
  const devTools = createDevToolsPanel({
    world,
    camera,
    onStepFrame: () => {
      world.time.then = performance.now() - 16;
      updateWorldTime(world);
      versusSystems(world);
      const info = updateInspector(
        animBundle,
        devTools.inspectorState.selectedEid,
      );
      Object.assign(devTools.inspectorState, info);
      renderer.render(scene, camera);
    },
    onStepTick: () => {},
  });

  // --- game loop ---
  let animFrameId: number;
  let wasPaused = false;

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

    versusSystems(world);

    const info = updateInspector(
      animBundle,
      devTools.inspectorState.selectedEid,
    );
    Object.assign(devTools.inspectorState, info);

    renderer.render(scene, camera);
  };

  animFrameId = requestAnimationFrame(animate);

  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(animFrameId);
    devTools.destroy();
    disposeControls();
    window.removeEventListener("resize", resize);
    dispose();
  };
};
