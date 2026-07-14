import { observe, onAdd, onRemove, hasComponent } from "bitecs";
import * as THREE from "three";
import { Position, SpellEffect, type World } from "@necro-crown/shared";

const PARTICLE_COUNT = 150;

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

interface SpellCircleEffect {
  ring: THREE.Mesh;
  fill: THREE.Mesh;
  points: THREE.Points;
  positions: Float32Array;
  sizes: Float32Array;
  alphas: Float32Array;
  particles: Particle[];
  fadeOut: boolean;
  fadeOutTimer: number;
}

const createParticleTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(220, 180, 255, 1)");
  gradient.addColorStop(0.2, "rgba(195, 96, 235, 0.8)");
  gradient.addColorStop(0.5, "rgba(140, 40, 200, 0.4)");
  gradient.addColorStop(1, "rgba(80, 0, 160, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
};

const particleTexture = createParticleTexture();

const createFillTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(120, 40, 200, 0.15)");
  gradient.addColorStop(0.6, "rgba(140, 50, 210, 0.25)");
  gradient.addColorStop(0.85, "rgba(160, 60, 230, 0.35)");
  gradient.addColorStop(1, "rgba(180, 70, 250, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
};

const fillTexture = createFillTexture();

const spawnEffect = (cx: number, cy: number, radius: number): SpellCircleEffect => {
  const ringGeo = new THREE.RingGeometry(radius * 0.85, radius, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xbb66ff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(cx, 0.05, cy);

  const fillGeo = new THREE.CircleGeometry(radius, 48);
  const fillMat = new THREE.MeshBasicMaterial({
    map: fillTexture,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const fill = new THREE.Mesh(fillGeo, fillMat);
  fill.rotation.x = -Math.PI / 2;
  fill.position.set(cx, 0.02, cy);

  const particles: Particle[] = [];
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const alphas = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius * 0.8;
    const x = cx + Math.cos(angle) * dist;
    const z = cy + Math.sin(angle) * dist;
    const y = Math.random() * 5;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const speed = 15 + Math.random() * 35;
    const spreadAngle = angle + (Math.random() - 0.5) * 1.5;
    particles.push({
      pos: new THREE.Vector3(x, y, z),
      vel: new THREE.Vector3(
        Math.cos(spreadAngle) * speed,
        8 + Math.random() * 15,
        Math.sin(spreadAngle) * speed,
      ),
      life: 0.6 + Math.random() * 1.4,
      maxLife: 0.6 + Math.random() * 1.4,
      size: 2 + Math.random() * 5,
    });

    sizes[i] = particles[i].size;
    alphas[i] = 1;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

  const mat = new THREE.PointsMaterial({
    map: particleTexture,
    size: 8,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;

  return {
    ring,
    fill,
    points,
    positions,
    sizes,
    alphas,
    particles,
    fadeOut: false,
    fadeOutTimer: 0,
  };
};

const updateCircleSize = (
  ring: THREE.Mesh,
  fill: THREE.Mesh,
  radius: number,
) => {
  const curRadius = (ring.geometry as THREE.RingGeometry).parameters.outerRadius;
  const diff = Math.abs(radius - curRadius);
  if (diff > 0.5) {
    ring.geometry.dispose();
    ring.geometry = new THREE.RingGeometry(radius * 0.85, radius, 48);

    fill.geometry.dispose();
    fill.geometry = new THREE.CircleGeometry(radius, 48);
  }
};

export const createDrawSpellEffectSystem = (
  world: World,
  scene: THREE.Scene,
) => {
  const effects = new Map<number, SpellCircleEffect>();

  const enterQueue: number[] = [];
  observe(world, onAdd(SpellEffect), (eid) => enterQueue.push(eid));

  const exitQueue: number[] = [];
  observe(world, onRemove(SpellEffect), (eid) => exitQueue.push(eid));

  return (world: World) => {
    const entered = enterQueue.splice(0);
    for (const eid of entered) {
      const cx = Position.x[eid];
      const cy = Position.y[eid];
      const initialSize = Math.max(SpellEffect.size[eid], 1);
      const effect = spawnEffect(cx, cy, initialSize);
      scene.add(effect.ring);
      scene.add(effect.fill);
      scene.add(effect.points);
      effects.set(eid, effect);
    }

    const dt = Math.min(world.time.delta / 1000, 0.05);

    for (const [eid, effect] of effects) {
      if (effect.fadeOut) {
        effect.fadeOutTimer += dt;
        const fadeProgress = Math.min(effect.fadeOutTimer / 0.5, 1);
        const fadeAlpha = 1 - fadeProgress;
        (effect.ring.material as THREE.MeshBasicMaterial).opacity = 0.5 * fadeAlpha;
        (effect.fill.material as THREE.MeshBasicMaterial).opacity = 0.6 * fadeAlpha;
        (effect.points.material as THREE.PointsMaterial).opacity = 0.7 * fadeAlpha;

        if (fadeProgress >= 1) {
          scene.remove(effect.ring);
          scene.remove(effect.fill);
          scene.remove(effect.points);
          effect.ring.geometry.dispose();
          (effect.ring.material as THREE.MeshBasicMaterial).dispose();
          effect.fill.geometry.dispose();
          (effect.fill.material as THREE.MeshBasicMaterial).dispose();
          effect.points.geometry.dispose();
          (effect.points.material as THREE.PointsMaterial).dispose();
          effects.delete(eid);
          continue;
        }
        continue;
      }

      const stillCasting = hasComponent(world, eid, SpellEffect);
      if (!stillCasting) {
        effect.fadeOut = true;
        effect.fadeOutTimer = 0;
        continue;
      }

      const radius = SpellEffect.size[eid];
      const cx = Position.x[eid];
      const cy = Position.y[eid];

      updateCircleSize(effect.ring, effect.fill, radius);

      effect.ring.position.set(cx, 0.05, cy);
      effect.fill.position.set(cx, 0.02, cy);

      for (let i = 0; i < effect.particles.length; i++) {
        const p = effect.particles[i];
        p.pos.x += p.vel.x * dt;
        p.pos.y += p.vel.y * dt;
        p.pos.z += p.vel.z * dt;
        p.vel.y -= 5 * dt;
        p.life -= dt;

        const lifeRatio = Math.max(p.life / p.maxLife, 0);
        effect.positions[i * 3] = p.pos.x;
        effect.positions[i * 3 + 1] = p.pos.y;
        effect.positions[i * 3 + 2] = p.pos.z;
        effect.alphas[i] = lifeRatio;

        if (p.life <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * radius * 0.8;
          p.pos.set(
            cx + Math.cos(angle) * dist,
            Math.random() * 3,
            cy + Math.sin(angle) * dist,
          );
          p.vel.set(
            Math.cos(angle) * (15 + Math.random() * 35),
            8 + Math.random() * 15,
            Math.sin(angle) * (15 + Math.random() * 35),
          );
          p.life = p.maxLife;
        }
      }

      effect.points.geometry.attributes.position.needsUpdate = true;
      effect.points.geometry.attributes.alpha.needsUpdate = true;
    }

    const exited = exitQueue.splice(0);
    for (const eid of exited) {
      const effect = effects.get(eid);
      if (effect && !effect.fadeOut) {
        effect.fadeOut = true;
        effect.fadeOutTimer = 0;
      }
    }

    return world;
  };
};
