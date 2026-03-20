import { Scene } from "phaser";
import { defineAction } from "../../input/Actions";
import { crownState$, playCard } from "$game/Crown";
import { UnitName } from "@necro-crown/shared";
import { createMouseManager } from "../../input";

// TODO: this isn't a system, let's move it elsewhere
export const initializeCrownMouseControls = (
  scene: Scene,
  handleOnPlay: (name: UnitName, x: number, y: number) => void,
) => {
  const canvas =
    document.getElementById("game-container") || document.documentElement;

  createMouseManager(canvas);

  const rect = canvas.getBoundingClientRect();
  const { left, top } = rect;

  let cameraDragStartX: number | null = null;
  let cameraDragStartY: number | null = null;

  const camera = scene.cameras.main;

  defineAction({
    name: "mouseAction",
    callback: (event) => {
      const { selectedCard } = crownState$.value;
      if (selectedCard === null) return;

      const mouseEvent = event as MouseEvent | DragEvent;

      const { x, y } = camera.getWorldPoint(
        mouseEvent.x - left,
        mouseEvent.y - top,
      );

      playCard(() => handleOnPlay(selectedCard.name, x, y));
    },
    binding: { mouseEvents: ["mouseup", "dragend"] },
  });

  scene.input.on("pointerdown", () => {
    cameraDragStartX = camera.scrollX;
    cameraDragStartY = camera.scrollY;
  });

  scene.input.on("pointerup", () => {
    cameraDragStartX = null;
    cameraDragStartY = null;
  });

  scene.input.on("pointermove", (pointer: any) => {
    if (cameraDragStartX === null || cameraDragStartY === null) return;

    if (pointer.isDown) {
      camera.scrollX =
        cameraDragStartX + (pointer.downX - pointer.x) / camera.zoom;
      camera.scrollY =
        cameraDragStartY + (pointer.downY - pointer.y) / camera.zoom;
    }
  });

  scene.input.on(
    "wheel",
    (
      pointer: any,
      gameObjects: any,
      deltaX: number,
      deltaY: number,
      deltaZ: number,
    ) => {
      // Get the current world point under pointer.
      if (deltaY === 0) return;
      const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
      const newZoom = camera.zoom - camera.zoom * 0.001 * deltaY;
      camera.zoom = Phaser.Math.Clamp(newZoom, 0.5, 1.5);

      // Update camera matrix, so `getWorldPoint` returns zoom-adjusted coordinates.
      const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);
      // Scroll the camera to keep the pointer under the same world point.
      camera.scrollX -= newWorldPoint.x - worldPoint.x;
      camera.scrollY -= newWorldPoint.y - worldPoint.y;
    },
  );
};
