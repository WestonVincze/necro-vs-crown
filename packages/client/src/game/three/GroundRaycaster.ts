import * as THREE from "three";

export const createGroundRaycaster = (
  canvas: HTMLCanvasElement,
  camera: THREE.OrthographicCamera,
  groundPlane: THREE.Plane,
): ((clientX: number, clientY: number) => THREE.Vector3 | null) => {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const result = new THREE.Vector3();

  return (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.ray.intersectPlane(groundPlane, result);
    return hit ? result.clone() : null;
  };
};
