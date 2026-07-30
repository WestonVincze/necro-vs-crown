import { fromEvent, map, switchMap, take, type Subscription } from "rxjs";
import * as THREE from "three";
import { addComponent, addEntity } from "bitecs";
import {
  type World,
  Position,
  GridCell,
  Cursor,
  getGridCellFromPosition,
} from "@necro-crown/shared";
import { createGroundRaycaster } from "./GroundRaycaster";

const MIN_ZOOM = 0.84;
const MAX_ZOOM = 2;

export const initializeNecroThreeControls = (
  canvas: HTMLCanvasElement,
  camera: THREE.OrthographicCamera,
  groundPlane: THREE.Plane,
  world: World,
): (() => void) => {
  const getGroundPoint = createGroundRaycaster(canvas, camera, groundPlane);

  const cursorEid = addEntity(world);
  addComponent(world, cursorEid, Cursor);
  addComponent(world, cursorEid, Position);
  addComponent(world, cursorEid, GridCell);

  const pointerDown$ = fromEvent<PointerEvent>(canvas, "pointerdown");
  const pointerUp$ = fromEvent<PointerEvent>(canvas, "pointerup");

  const tapThresholdMs = 300;
  const tapMoveThresholdPx = 25;

  const cleanup: (() => void)[] = [];

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
        const hit = getGroundPoint(up.clientX, up.clientY);
        if (hit) {
          const gameX = hit.x;
          const gameY = hit.z;
          Position.x[cursorEid] = gameX;
          Position.y[cursorEid] = gameY;
          const gridCellPosition = getGridCellFromPosition({
            x: gameX,
            y: gameY,
          });
          GridCell.x[cursorEid] = gridCellPosition.x;
          GridCell.y[cursorEid] = gridCellPosition.y;
        }
      }
    });
  cleanup.push(() => pointerSub.unsubscribe());

  // --- scroll-wheel zoom (keep pointer under the same world point) ---
  const onWheel = (ev: WheelEvent) => {
    ev.preventDefault();
    const worldBefore = getGroundPoint(ev.clientX, ev.clientY);
    if (!worldBefore) return;

    const oldZoom = camera.zoom;
    const newZoom = THREE.MathUtils.clamp(
      oldZoom - oldZoom * 0.001 * ev.deltaY,
      MIN_ZOOM,
      MAX_ZOOM,
    );

    camera.zoom = newZoom;
    camera.updateProjectionMatrix();

    const worldAfter = getGroundPoint(ev.clientX, ev.clientY);
    if (worldAfter) {
      const dx = worldBefore.x - worldAfter.x;
      const dz = worldBefore.z - worldAfter.z;
      camera.position.x += dx;
      camera.position.z += dz;
    }
  };
  canvas.addEventListener("wheel", onWheel, { passive: false });
  cleanup.push(() => canvas.removeEventListener("wheel", onWheel));

  return () => {
    for (const fn of cleanup) fn();
  };
};
