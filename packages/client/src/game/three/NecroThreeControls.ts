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

export const initializeNecroThreeControls = (
  canvas: HTMLCanvasElement,
  camera: THREE.OrthographicCamera,
  groundPlane: THREE.Plane,
  world: World,
): (() => void) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const cursorEid = addEntity(world);
  addComponent(world, cursorEid, Cursor);
  addComponent(world, cursorEid, Position);
  addComponent(world, cursorEid, GridCell);

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
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((up.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((up.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const target = new THREE.Vector3();
        const hit = raycaster.ray.intersectPlane(groundPlane, target);

        if (hit) {
          const gameX = target.x;
          const gameY = target.z;
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

  return () => {
    pointerSub.unsubscribe();
  };
};
