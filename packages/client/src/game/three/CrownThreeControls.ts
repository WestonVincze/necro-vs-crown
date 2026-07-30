import * as THREE from "three";
import { crownClientState } from "$game/Crown";
import { createGroundRaycaster } from "./GroundRaycaster";

const MIN_ZOOM = 0.84;
const MAX_ZOOM = 2;
const CAM_SPEED = 600;

export const initializeCrownThreeControls = (
  canvas: HTMLCanvasElement,
  camera: THREE.OrthographicCamera,
  groundPlane: THREE.Plane,
  handlePlayCard: (x: number, y: number) => void,
  scene?: THREE.Scene,
): (() => void) => {
  const getGroundPoint = createGroundRaycaster(canvas, camera, groundPlane);

  let pointerIsDown = false;
  let wasdActive = false;
  let downScreenX = 0;
  let downScreenY = 0;
  const startCamPos = new THREE.Vector3();
  const startLookAt = new THREE.Vector3();
  const lookAtTarget = new THREE.Vector3(0, 0, 0);

  const keys: Record<string, boolean> = {};

  const cleanup: (() => void)[] = [];

  // --- drag-and-drop preview ---
  let previewMesh: THREE.Mesh | null = null;
  let isDraggingCard = false;
  let dragCardId: number | undefined;

  const showPreview = (x: number, z: number) => {
    if (!scene) return;
    if (!previewMesh) {
      const geo = new THREE.RingGeometry(24, 30, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xbb66ff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      previewMesh = new THREE.Mesh(geo, mat);
      previewMesh.rotation.x = -Math.PI / 2;
      previewMesh.position.y = 0.1;
      scene.add(previewMesh);
    }
    previewMesh.position.x = x;
    previewMesh.position.z = z;
    previewMesh.visible = true;
  };

  const hidePreview = () => {
    if (previewMesh) previewMesh.visible = false;
  };

  // --- camera helpers ---
  const panCamera = (worldDX: number, worldDZ: number) => {
    camera.position.x += worldDX;
    camera.position.z += worldDZ;
    lookAtTarget.x += worldDX;
    lookAtTarget.z += worldDZ;
    camera.lookAt(lookAtTarget);
  };

  const screenToWorldXZ = (
    clientX: number,
    clientY: number,
  ): { x: number; z: number } | null => {
    const pt = getGroundPoint(clientX, clientY);
    return pt ? { x: pt.x, z: pt.z } : null;
  };

  // Compute the world-Z component of the camera's local Y axis
  // This converts camera-local frustum height to ground-plane movement.
  camera.updateMatrixWorld(true);
  const localY = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const pitchFactor = Math.abs(localY.z) || 1 / Math.SQRT2;

  // --- pointer events for camera ---
  const onPointerDown = (ev: PointerEvent) => {
    pointerIsDown = true;
    downScreenX = ev.clientX;
    downScreenY = ev.clientY;
    startCamPos.copy(camera.position);
    startLookAt.copy(lookAtTarget);
  };

  const onPointerMove = (ev: PointerEvent) => {
    if (isDraggingCard) {
      const pt = getGroundPoint(ev.clientX, ev.clientY);
      if (pt) showPreview(pt.x, pt.z);
      return;
    }
    if (!pointerIsDown || wasdActive) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ev.clientX - downScreenX;
    const dy = ev.clientY - downScreenY;
    const fw = (camera.right - camera.left) / camera.zoom;
    const fh = (camera.top - camera.bottom) / camera.zoom;
    const worldDX = -(dx / rect.width) * fw;
    const worldDZ = -(dy / rect.height) * fh * pitchFactor;
    camera.position
      .copy(startCamPos)
      .add(new THREE.Vector3(worldDX, 0, worldDZ));
    lookAtTarget.copy(startLookAt).add(new THREE.Vector3(worldDX, 0, worldDZ));
    camera.lookAt(lookAtTarget);
  };

  const onPointerUp = (ev: PointerEvent) => {
    pointerIsDown = false;
    const selectedCard = crownClientState.getSelectedCard();
    if (selectedCard && selectedCard.id !== undefined) {
      const pt = getGroundPoint(ev.clientX, ev.clientY);
      if (pt) handlePlayCard(pt.x, pt.z);
    }
  };

  // --- wheel zoom ---
  const onWheel = (ev: WheelEvent) => {
    ev.preventDefault();
    const worldPt = screenToWorldXZ(ev.clientX, ev.clientY);
    if (!worldPt) return;

    const oldZoom = camera.zoom;
    const newZoom = THREE.MathUtils.clamp(
      oldZoom - oldZoom * 0.001 * ev.deltaY,
      MIN_ZOOM,
      MAX_ZOOM,
    );

    camera.zoom = newZoom;
    camera.updateProjectionMatrix();

    const afterPt = screenToWorldXZ(ev.clientX, ev.clientY);
    if (afterPt) {
      panCamera(worldPt.x - afterPt.x, worldPt.z - afterPt.z);
    }
  };

  // --- WASD ---
  const onKeyDown = (ev: KeyboardEvent) => {
    keys[ev.key.toLowerCase()] = true;
    updateWASDActive();
  };

  const onKeyUp = (ev: KeyboardEvent) => {
    keys[ev.key.toLowerCase()] = false;
    updateWASDActive();
  };

  const updateWASDActive = () => {
    wasdActive = !!(keys["w"] || keys["a"] || keys["s"] || keys["d"]);
  };

  const onDragOver = (ev: DragEvent) => {
    ev.preventDefault();
    if (dragCardId === undefined) return;
    const pt = getGroundPoint(ev.clientX, ev.clientY);
    if (pt) showPreview(pt.x, pt.z);
  };

  const onDragEnter = (ev: DragEvent) => {
    ev.preventDefault();
  };

  const onDragLeave = (ev: DragEvent) => {
    if (ev.target === canvas) hidePreview();
  };

  const onDrop = (ev: DragEvent) => {
    ev.preventDefault();
    hidePreview();
    if (dragCardId === undefined) return;
    const pt = getGroundPoint(ev.clientX, ev.clientY);
    if (pt) {
      handlePlayCard(pt.x, pt.z);
    }
    dragCardId = undefined;
    isDraggingCard = false;
    crownClientState.deselectCard();
  };

  const onDocumentDragStart = (ev: DragEvent) => {
    const el = ev.target as HTMLElement;
    const wrapper = el?.closest(".card-wrapper");
    if (!wrapper) return;
    const eid = wrapper.getAttribute("data-card-id");
    if (eid !== null) {
      const id = parseInt(eid, 10);
      // crownClientState.selectCard(id);
      dragCardId = id;
      isDraggingCard = true;
    }
  };

  const onDocumentDragEnd = (_ev: DragEvent) => {
    hidePreview();
    dragCardId = undefined;
    isDraggingCard = false;
  };

  // --- register events ---
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("dragover", onDragOver);
  canvas.addEventListener("dragenter", onDragEnter);
  canvas.addEventListener("dragleave", onDragLeave);
  canvas.addEventListener("drop", onDrop);
  document.addEventListener("dragstart", onDocumentDragStart);
  document.addEventListener("dragend", onDocumentDragEnd);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  cleanup.push(() => canvas.removeEventListener("pointerdown", onPointerDown));
  cleanup.push(() => canvas.removeEventListener("pointermove", onPointerMove));
  cleanup.push(() => canvas.removeEventListener("pointerup", onPointerUp));
  cleanup.push(() => canvas.removeEventListener("wheel", onWheel));
  cleanup.push(() => canvas.removeEventListener("dragover", onDragOver));
  cleanup.push(() => canvas.removeEventListener("dragenter", onDragEnter));
  cleanup.push(() => canvas.removeEventListener("dragleave", onDragLeave));
  cleanup.push(() => canvas.removeEventListener("drop", onDrop));
  cleanup.push(() =>
    document.removeEventListener("dragstart", onDocumentDragStart),
  );
  cleanup.push(() =>
    document.removeEventListener("dragend", onDocumentDragEnd),
  );
  cleanup.push(() => window.removeEventListener("keydown", onKeyDown));
  cleanup.push(() => window.removeEventListener("keyup", onKeyUp));

  // --- WASD camera loop ---
  let animFrameId: number;
  const cameraMoveLoop = () => {
    animFrameId = requestAnimationFrame(cameraMoveLoop);
    if (pointerIsDown) return;
    let dx = 0;
    let dz = 0;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;
    if (keys["w"]) dz -= 1;
    if (keys["s"]) dz += 1;
    if (dx !== 0 || dz !== 0) {
      wasdActive = true;
      const dt = 1 / 60;
      const speed = (CAM_SPEED * dt) / camera.zoom;
      panCamera(dx * speed, dz * speed);
    }
  };
  cameraMoveLoop();
  cleanup.push(() => cancelAnimationFrame(animFrameId));

  // --- cleanup preview ---
  cleanup.push(() => {
    if (previewMesh) {
      previewMesh.geometry.dispose();
      (previewMesh.material as THREE.Material).dispose();
      scene?.remove(previewMesh);
    }
  });

  return () => {
    for (const fn of cleanup) fn();
  };
};
