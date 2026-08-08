import * as THREE from "three";

export interface CameraRigState {
  pitchDeg: number;
}

export const cameraRig: CameraRigState = { pitchDeg: 30 };

export const MAX_PITCH_DEG = 89;

const CAMERA_DISTANCE = Math.hypot(1000, 1000);

const focus = new THREE.Vector3(0, 0, 0);

const SHADOW_LIGHT_OFFSET = { x: 500, y: 1000, z: 500 };
let shadowLight: THREE.DirectionalLight | null = null;

export const registerShadowLight = (light: THREE.DirectionalLight): void => {
  shadowLight = light;
};

export const applyCameraRig = (
  camera: THREE.OrthographicCamera,
  focusX: number = focus.x,
  focusZ: number = focus.z,
): void => {
  focus.set(focusX, 0, focusZ);

  const pitch = THREE.MathUtils.degToRad(
    THREE.MathUtils.clamp(cameraRig.pitchDeg, 1, MAX_PITCH_DEG),
  );

  camera.position.set(
    focusX,
    Math.sin(pitch) * CAMERA_DISTANCE,
    focusZ + Math.cos(pitch) * CAMERA_DISTANCE,
  );
  camera.lookAt(focusX, 0, focusZ);

  if (shadowLight) {
    shadowLight.position.set(
      focusX + SHADOW_LIGHT_OFFSET.x,
      SHADOW_LIGHT_OFFSET.y,
      focusZ + SHADOW_LIGHT_OFFSET.z,
    );
    shadowLight.target.position.set(focusX, 0, focusZ);
    shadowLight.target.updateMatrixWorld();
  }
};
