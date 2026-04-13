import { Scene } from "phaser";
import { defineAction } from "./Actions";
import { crownClientState } from "$game/Crown";
import { createMouseManager } from ".";

// TODO: this isn't a system, let's move it elsewhere
export const initializeCrownControls = (
  scene: Scene,
  handleOnPlay: (cardId: number, x: number, y: number) => void,
) => {
  const canvas = document.getElementById("ui") || document.documentElement;

  createMouseManager(canvas);

  const rect = canvas.getBoundingClientRect();
  const { left, top } = rect;

  let cameraDragStartX: number | null = null;
  let cameraDragStartY: number | null = null;
  let pointerIsDown = false;
  let wasdActive = false;

  const camera = scene.cameras.main;

  defineAction({
    name: "mouseAction",
    callback: (event) => {
      const selectedCard = crownClientState.getSelectedCard();
      if (selectedCard === null || !selectedCard.id) return;

      const mouseEvent = event as MouseEvent | DragEvent;

      const { x, y } = camera.getWorldPoint(
        mouseEvent.x - left,
        mouseEvent.y - top,
      );

      handleOnPlay(selectedCard.id, x, y);
    },
    binding: { mouseEvents: ["dragend"] },
  });

  scene.input.on("pointerdown", () => {
    pointerIsDown = true;
    if (!wasdActive) {
      cameraDragStartX = camera.scrollX;
      cameraDragStartY = camera.scrollY;
    } else {
      cameraDragStartX = null;
      cameraDragStartY = null;
    }
  });

  scene.input.on("pointerup", (pointer: any) => {
    pointerIsDown = false;
    cameraDragStartX = null;
    cameraDragStartY = null;
    const selectedCard = crownClientState.getSelectedCard();
    if (selectedCard !== null && selectedCard.id) {
      const { x, y } = camera.getWorldPoint(pointer.x, pointer.y);
      handleOnPlay(selectedCard.id, x, y);
    }
  });

  scene.input.on("pointermove", (pointer: any) => {
    if (!pointerIsDown || wasdActive) return;
    if (!cameraDragStartX || !cameraDragStartY) return;

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
      camera.zoom = Phaser.Math.Clamp(newZoom, 0.84, 2);

      camera.preRender();
      const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);
      // Scroll the camera to keep the pointer under the same world point.
      camera.scrollX -= newWorldPoint.x - worldPoint.x;
      camera.scrollY -= newWorldPoint.y - worldPoint.y;
    },
  );

  // --- WASD camera movement ---
  const keys = scene.input.keyboard?.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  }) as {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  const updateWASDActive = () => {
    wasdActive = !!(
      keys &&
      (keys.left.isDown ||
        keys.right.isDown ||
        keys.up.isDown ||
        keys.left.isDown)
    );

    if (wasdActive) {
      cameraDragStartX = null;
      cameraDragStartY = null;
    }
  };

  scene.input.keyboard?.on("keydown", updateWASDActive);
  scene.input.keyboard?.on("keyup", updateWASDActive);

  const CAM_SPEED = 600;

  const onUpdate = (_time: number, delta: number) => {
    const dt = delta / 1000;
    if (pointerIsDown) return;

    let dx = 0;
    let dy = 0;
    if (keys.left.isDown) dx -= 1;
    if (keys.right.isDown) dx += 1;
    if (keys.up.isDown) dy -= 1;
    if (keys.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      wasdActive = true;
      camera.scrollX += (dx * CAM_SPEED * dt) / camera.zoom;
      camera.scrollY += (dy * CAM_SPEED * dt) / camera.zoom;
    } else {
      wasdActive = false;
    }
  };

  scene.events.on("update", onUpdate);
};
