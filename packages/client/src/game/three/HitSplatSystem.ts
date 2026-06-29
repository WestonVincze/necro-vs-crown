import * as THREE from "three";
import type { World } from "@necro-crown/shared";

const HIT_SPLAT_DURATION = 500;

interface HitSplatEntry {
  sprite: THREE.Sprite;
  texture: THREE.CanvasTexture;
  createdAt: number;
  startX: number;
  startY: number;
  startZ: number;
}

const colors = {
  purple: { miss: "#dbaded", hit: "#c360eb", crit: "#ab17e6" },
  red: { miss: "#ff9191", hit: "#ff5555", crit: "#ed2424" },
};

export const createHitSplatSystem = (world: World, scene: THREE.Scene) => {
  const active: HitSplatEntry[] = [];

  world.gameEvents.hitSplat$.subscribe(
    ({ amount, isCrit, position, colorSet }) => {
      const { x, y } = position;
      const palette = colors[colorSet];

      let color: string;
      let fontSize = "16px";
      let label = String(Math.abs(amount).toFixed(0));

      if (amount === 0) {
        color = palette.miss;
      } else if (isCrit) {
        color = palette.crit;
        fontSize = "20px";
        label += "!";
      } else {
        color = palette.hit;
      }

      const xVariance = Math.random() * 30 - 15;
      const yVariance = Math.random() * 30 - 15;

      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;

      // star shape behind the text
      ctx.fillStyle = color;
      ctx.beginPath();
      const cx = 64;
      const cy = 16;
      const spikes = 6;
      const outerR = 12;
      const innerR = 5;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (Math.PI * i) / spikes - Math.PI / 2;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // damage number
      ctx.fillStyle = "#FFF";
      ctx.font = `bold ${fontSize} Wellfleet, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 64, 16);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: 1,
      });
      const sprite = new THREE.Sprite(material);
      const worldX = x + xVariance;
      const worldZ = y + yVariance;
      sprite.position.set(worldX, 60, worldZ);
      sprite.scale.set(32, 8, 1);

      scene.add(sprite);

      active.push({
        sprite,
        texture,
        createdAt: performance.now(),
        startX: worldX,
        startY: 60,
        startZ: worldZ,
      });
    },
  );

  return (world: World) => {
    const now = performance.now();

    for (let i = active.length - 1; i >= 0; i--) {
      const entry = active[i];
      const t = Math.min((now - entry.createdAt) / HIT_SPLAT_DURATION, 1);

      if (t >= 1) {
        scene.remove(entry.sprite);
        entry.texture.dispose();
        (entry.sprite.material as THREE.Material).dispose();
        active.splice(i, 1);
        continue;
      }

      const floatUp = t * 15;
      const s = 1.3 - t * 0.5;
      const alpha = 1 - t;

      entry.sprite.position.set(
        entry.startX,
        entry.startY + floatUp,
        entry.startZ,
      );
      entry.sprite.scale.set(32 * s, 8 * s, 1);
      (entry.sprite.material as THREE.SpriteMaterial).opacity = alpha;
    }

    return world;
  };
};
