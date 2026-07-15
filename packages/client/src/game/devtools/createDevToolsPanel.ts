import GUI from "lil-gui";
import * as THREE from "three";
import type { World } from "@necro-crown/shared";

export interface DevToolsOptions {
  world: World;
  camera?: THREE.OrthographicCamera;
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
    const camState = {
      zoom: camera.top * 2,
    };

    const camFolder = gui.addFolder("Camera");
    camFolder
      .add(camState, "zoom", 100, 5000, 1)
      .name("Zoom")
      .onChange(updateZoom);
    camFolder.open();

    function updateZoom(v: number) {
      const aspect = camera.right / camera.top;
      camera.left = (v * aspect) / -2;
      camera.right = (v * aspect) / 2;
      camera.top = v / 2;
      camera.bottom = v / -2;
      camera.updateProjectionMatrix();
      camState.zoom = v;
    }
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
