import { Scene } from "phaser";

export const initializePlaygroundControls = (
  scene: Scene,
  handleOnPlay: (x: number, y: number) => boolean,
) => {
  const canvas =
    document.getElementById("game-container") || document.documentElement;

  let cameraDragStartX: number | null = null;
  let cameraDragStartY: number | null = null;
  let pointerIsDown = false;
  let wasdActive = false;

  const camera = scene.cameras.main;

  scene.input.on("pointerdown", (pointer: PointerEvent) => {
    const active = document.activeElement as HTMLElement | null;
    if (active && active !== canvas) active.blur();
    // canvas.focus();
    const { x, y } = camera.getWorldPoint(pointer.x, pointer.y);
    if (handleOnPlay(x, y)) return;
    pointerIsDown = true;
    if (!wasdActive) {
      cameraDragStartX = camera.scrollX;
      cameraDragStartY = camera.scrollY;
    } else {
      cameraDragStartX = null;
      cameraDragStartY = null;
    }
  });

  scene.input.on("pointerup", () => {
    pointerIsDown = false;
    cameraDragStartX = null;
    cameraDragStartY = null;
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
