import type { Scene } from "phaser";
import { fromEvent, map, Subscription, switchMap, take } from "rxjs";

// TODO: this isn't a system, let's move it elsewhere
export const initializeNecroMouseControls = (
  scene: Scene,
  onClick: (x: number, y: number) => void,
) => {
  const canvas =
    document.querySelector("#game-container canvas") ||
    document.documentElement;

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
        // wait for the next pointerup for this pointer; simple take(1) is fine for common cases
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
        // recalc bounding rect each time (canvas may resize or be transformed)
        const rect = (canvas as Element).getBoundingClientRect();
        const worldPoint = scene.cameras.main.getWorldPoint(
          up.clientX - rect.left,
          up.clientY - rect.top,
        );
        onClick(worldPoint.x, worldPoint.y);
      }
    });

  // keep a reference so we can unsubscribe on shutdown
  const mouseClickSubscription = pointerSub;

  scene.events.once("shutdown", () => {
    mouseClickSubscription.unsubscribe();
    mouseClickSubscription.unsubscribe();
  });
};
