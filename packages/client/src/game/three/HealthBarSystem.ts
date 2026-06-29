import { observe, onAdd, onRemove, query } from "bitecs";
import * as THREE from "three";
import {
  Health,
  Position,
  Transform,
  type World,
} from "@necro-crown/shared";

const HEALTH_BAR_HEIGHT = 5;
const BAR_OFFSET_Y = 8;

export const createHealthBarSystem = (world: World, scene: THREE.Scene) => {
  const healthBarsById = new Map<
    number,
    {
      sprite: THREE.Sprite;
      ctx: CanvasRenderingContext2D;
      texture: THREE.CanvasTexture;
    }
  >();

  const healthQuery = (world: World) =>
    query(world, [Health, Position, Transform]);

  const onEnterQueue: number[] = [];
  observe(world, onAdd(Health, Position, Transform), (eid) =>
    onEnterQueue.push(eid),
  );

  const onExitQueue: number[] = [];
  observe(world, onRemove(Health, Position, Transform), (eid) =>
    onExitQueue.push(eid),
  );

  return (world: World) => {
    const exited = onExitQueue.splice(0);
    for (const eid of exited) {
      const entry = healthBarsById.get(eid);
      if (entry) {
        scene.remove(entry.sprite);
        entry.texture.dispose();
        (entry.sprite.material as THREE.Material).dispose();
      }
      healthBarsById.delete(eid);
    }

    const entered = onEnterQueue.splice(0);
    for (const eid of entered) {
      const width = Math.max(Transform.width[eid] - 8, 4);
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = HEALTH_BAR_HEIGHT;
      const ctx = canvas.getContext("2d")!;

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(width, HEALTH_BAR_HEIGHT, 1);

      scene.add(sprite);
      healthBarsById.set(eid, { sprite, ctx, texture });
    }

    for (const eid of healthQuery(world)) {
      const entry = healthBarsById.get(eid);
      if (!entry) continue;

      const { sprite, ctx, texture } = entry;
      const w = Transform.width[eid];
      const h = Transform.height[eid];
      const healthPercent = Math.max(
        0,
        Math.min(1, Health.current[eid] / Health.max[eid]),
      );

      sprite.position.set(Position.x[eid], h + BAR_OFFSET_Y, Position.y[eid]);
      sprite.scale.x = Math.max(w - 8, 4);

      ctx.fillStyle = "#aa5555";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#55aa55";
      ctx.fillRect(0, 0, ctx.canvas.width * healthPercent, ctx.canvas.height);

      texture.needsUpdate = true;
    }

    return world;
  };
};
