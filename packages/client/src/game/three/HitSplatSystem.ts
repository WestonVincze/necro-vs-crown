import * as THREE from "three";
import type { World } from "@necro-crown/shared";

const HIT_SPLAT_DURATION = 750;

interface HitSplatEntry {
  sprite: THREE.Sprite;
  texture: THREE.Texture;
  createdAt: number;
  startX: number;
  startY: number;
  startZ: number;
}

const colors = {
  purple: { miss: "#dbaded", hit: "#c360eb", crit: "#ab17e6" },
  red: { miss: "#ff9191", hit: "#ff5555", crit: "#ed2424" },
};

const CANVAS_SIZE = 128;
const STAR_POINTS = 12;
const STAR_OUTER_R = 48;
const STAR_INNER_R = 30;

const drawHitSplat = (
  ctx: CanvasRenderingContext2D,
  color: string,
  fontSize: string,
  label: string,
) => {
  const w = CANVAS_SIZE;
  const h = CANVAS_SIZE;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // star shape
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < STAR_POINTS * 2; i++) {
    const r = i % 2 === 0 ? STAR_OUTER_R : STAR_INNER_R;
    const angle = (Math.PI * i) / STAR_POINTS - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
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
  ctx.fillText(label, cx, cy);
};

export const createHitSplatSystem = (world: World, scene: THREE.Scene) => {
  const active: HitSplatEntry[] = [];

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;

  const sourceTexture = new THREE.CanvasTexture(canvas);
  sourceTexture.minFilter = THREE.NearestFilter;
  sourceTexture.magFilter = THREE.NearestFilter;

  world.gameEvents.hitSplat$.subscribe(
    ({ amount, isCrit, position, colorSet }) => {
      const { x, y } = position;
      const palette = colors[colorSet];

      let color: string;
      let fontSize = "36px";
      let label = String(Math.abs(amount).toFixed(0));

      if (amount === 0) {
        color = palette.miss;
      } else if (isCrit) {
        color = palette.crit;
        fontSize = "48px";
        label += "!";
      } else {
        color = palette.hit;
      }

      drawHitSplat(ctx, color, fontSize, label);
      sourceTexture.needsUpdate = true;

      const texture = sourceTexture.clone();
      texture.needsUpdate = true;

      const xVariance = Math.random() * 30 - 15;
      const yVariance = Math.random() * 30 - 15;

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
      sprite.scale.set(24, 24, 1);

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

      const ease = 1 - (1 - t) * (1 - t);
      const floatUp = ease * 15;
      const s = 1.3 - ease * 0.5;
      const alpha = 1 - t;

      entry.sprite.position.set(
        entry.startX,
        entry.startY + floatUp,
        entry.startZ,
      );
      entry.sprite.scale.set(64 * s, 64 * s, 1);
      (entry.sprite.material as THREE.SpriteMaterial).opacity = alpha;
    }

    return world;
  };
};
