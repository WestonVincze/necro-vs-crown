import GUI from "lil-gui";
import * as THREE from "three";
import type { World } from "@necro-crown/shared";
import {
  applyCameraRig,
  cameraRig,
  MAX_PITCH_DEG,
} from "$game/three/CameraRig";

export interface DevToolsOptions {
  world: World;
  camera?: THREE.OrthographicCamera;
  gridHelper?: THREE.Object3D;
  onStepFrame?: () => void;
  onStepTick?: () => void;
}

export interface DevToolsState {
  godMode: boolean;
}

export interface InspectorState {
  selectedEid: number;
  hasModel: boolean;
  animState: string;
  currentAnim: string;
  posX: number;
  posY: number;
}

export interface DevToolsHandle {
  destroy: () => void;
  state: DevToolsState;
  inspectorState: InspectorState;
}

export const createDevToolsPanel = (
  options: DevToolsOptions,
): DevToolsHandle => {
  const gui = new GUI({ title: "Dev Tools" });
  const state: DevToolsState = { godMode: false };
  const inspectorState: InspectorState = {
    selectedEid: 0,
    hasModel: false,
    animState: "",
    currentAnim: "",
    posX: 0,
    posY: 0,
  };

  const worldFolder = gui.addFolder("World");
  worldFolder.add(options.world, "paused").name("Paused");
  worldFolder.add(state, "godMode").name("God Mode");

  if (options.onStepTick) {
    worldFolder.add({ "Step Tick": options.onStepTick }, "Step Tick");
  }
  if (options.onStepFrame) {
    worldFolder.add({ "Step Frame": options.onStepFrame }, "Step Frame");
  }
  worldFolder.open();

  if (options.camera) {
    const camera = options.camera;

    const camFolder = gui.addFolder("Camera");
    camFolder
      .add(cameraRig, "pitchDeg", 5, MAX_PITCH_DEG, 1)
      .name("Pitch (°)")
      .onChange(() => applyCameraRig(camera));
    camFolder
      .add(camera, "zoom", 0.25, 4, 0.05)
      .name("Zoom")
      .onChange(() => camera.updateProjectionMatrix())
      .listen();
    camFolder.open();
  }

  if (options.gridHelper) {
    const grid = options.gridHelper;
    worldFolder
      .add({ showGrid: grid.visible }, "showGrid")
      .name("Show Grid")
      .onChange((v: boolean) => {
        grid.visible = v;
      });
  }

  const inspectorFolder = gui.addFolder("Animation");
  inspectorFolder.add(inspectorState, "animState").name("Anim State").listen();
  inspectorFolder.add(inspectorState, "currentAnim").name("Animation").listen();
  inspectorFolder.open();

  return {
    destroy: () => gui.destroy(),
    state,
    inspectorState,
  };
};
