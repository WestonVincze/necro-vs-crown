import type { Scene } from "phaser";
import { fromEvent, map } from "rxjs";

// TODO: this isn't a system, let's move it elsewhere
export const initializeNecroMouseControls = (
  scene: Scene,
  onClick: (x: number, y: number) => void,
) => {
  const canvas =
    document.getElementById("game-container") || document.documentElement;

  const rect = canvas.getBoundingClientRect();

  const mouseClick$ = fromEvent<MouseEvent>(canvas, "mousedown").pipe(
    map((event) =>
      scene.cameras.main.getWorldPoint(
        event.clientX - rect.left,
        event.clientY - rect.top,
      ),
    ),
  );

  const mouseClickSubscription = mouseClick$.subscribe(({ x, y }) => {
    onClick(x, y);
  });

  scene.events.once("shutdown", () => {
    mouseClickSubscription.unsubscribe();
  });
};
