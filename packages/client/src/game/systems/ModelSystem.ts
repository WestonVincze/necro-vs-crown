import { observe, onAdd, onRemove, hasComponent, query } from "bitecs";
import * as THREE from "three";
import {
  Networked,
  Position,
  Sprite,
  Transform,
  type World,
  SpriteTexture,
} from "@necro-crown/shared";
import { modelBank } from "$game/three/ModelBank";
import { addOutline, createToonMaterial } from "$game/three/ToonShading";
import { AnimatorStore } from "$game/animation";

const smoothRotate = (
  obj: THREE.Object3D,
  targetHeading: number,
  speed: number,
  dt: number,
) => {
  const targetRot = Math.PI / 2 - targetHeading;
  const currentRot = obj.rotation.y;
  const diff = targetRot - currentRot;
  const shortest = Math.atan2(Math.sin(diff), Math.cos(diff));
  const maxStep = speed * dt;
  if (Math.abs(shortest) <= maxStep) {
    obj.rotation.y = targetRot;
  } else {
    obj.rotation.y += Math.sign(shortest) * maxStep;
  }
};

const TEXTURE_COLORS: Partial<Record<SpriteTexture, number>> = {
  [SpriteTexture.Necromancer]: 0x9b59b6,
  [SpriteTexture.Skeleton]: 0xecf0f1,
  [SpriteTexture.Peasant]: 0xe67e22,
  [SpriteTexture.Militia]: 0xe74c3c,
  [SpriteTexture.Guard]: 0xe74c3c,
  [SpriteTexture.Paladin]: 0xf1c40f,
  [SpriteTexture.Archer]: 0xe67e22,
  [SpriteTexture.Doppelsoldner]: 0xc0392b,
  [SpriteTexture.Berserker]: 0xe67e22,
  [SpriteTexture.Priest]: 0xf39c12,
  [SpriteTexture.Bones]: 0xbdc3c7,
  [SpriteTexture.MedHelm]: 0x95a5a6,
  [SpriteTexture.BucketHelm]: 0x7f8c8d,
  [SpriteTexture.GreatSword]: 0x95a5a6,
  [SpriteTexture.Crossbow]: 0x95a5a6,
  [SpriteTexture.Arrow]: 0xd35400,
  [SpriteTexture.Hut]: 0x8b4513,
  [SpriteTexture.Tower]: 0x808080,
};

export interface PillEntry {
  type: "pill";
  mesh: THREE.Mesh;
  eid: number;
}

export interface ModelEntry {
  type: "model";
  eid: number;
  group: THREE.Group;
}

export type Entry = PillEntry | ModelEntry;

export const createModelSystem = (
  world: World,
  scene: THREE.Scene,
  store: AnimatorStore,
) => {
  const entries = new Map<number, Entry>();

  const modelQuery = (world: World) => query(world, [Position, Sprite]);

  const enterQueue: number[] = [];
  observe(world, onAdd(Position, Transform, Sprite), (eid) =>
    enterQueue.push(eid),
  );

  const exitQueue: number[] = [];
  observe(world, onRemove(Sprite), (eid) => exitQueue.push(eid));

  const run = (world: World) => {
    const exited = exitQueue.splice(0);
    for (const eid of exited) {
      const entry = entries.get(eid);
      if (entry) {
        const obj = entry.type === "pill" ? entry.mesh : entry.group;
        scene.remove(obj);
        if (entry.type === "model") store.detach(eid);
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      entries.delete(eid);
    }

    const entered = enterQueue.splice(0);
    for (const eid of entered) {
      const textureId = Sprite.texture[eid] as SpriteTexture;
      const modelData = modelBank.getModel(textureId);

      if (modelData) {
        const group = modelData.scene.clone(true);
        group.position.set(Position.x[eid], 0, Position.y[eid]);
        group.scale.set(100, 100, 100);
        group.userData.entityId = eid;
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.frustumCulled = false;
            child.matrixAutoUpdate = true;
            // Outline hulls must stay BackSide or the effect vanishes.
            if (child.userData.isOutline) {
              // skip material overrides
            } else if (child.material instanceof THREE.Material) {
              (child.material as THREE.Material).side = THREE.DoubleSide;
            } else if (Array.isArray(child.material)) {
              child.material.forEach((m) => (m.side = THREE.DoubleSide));
            }
            if (child instanceof THREE.SkinnedMesh) {
              child.normalizeSkinWeights();
              const boneMap = new Map<string, THREE.Bone>();
              group.traverse((node) => {
                if (node instanceof THREE.Bone) {
                  boneMap.set(node.name, node);
                }
              });
              const clonedBones = child.skeleton.bones.map(
                (bone) => boneMap.get(bone.name) ?? bone,
              );
              const clonedSkeleton = new THREE.Skeleton(
                clonedBones,
                child.skeleton.boneInverses,
              );
              child.bind(clonedSkeleton, child.bindMatrix);
            }
          }
        });
        scene.add(group);

        const textureKey = SpriteTexture[textureId] ?? "Unknown";
        store.attach(eid, group, textureKey);

        entries.set(eid, {
          type: "model",
          eid,
          group,
        });
      } else {
        const width = Math.max(Transform.width[eid], 1);
        const height = Math.max(Transform.height[eid], 1);
        const color = TEXTURE_COLORS[textureId] ?? 0x888888;

        let geometry: THREE.BufferGeometry;
        if (height > width) {
          const radius = width / 2;
          const capsuleLength = height - width;
          geometry = new THREE.CapsuleGeometry(radius, capsuleLength, 8, 12);
        } else {
          geometry = new THREE.SphereGeometry(width / 2, 12, 8);
        }

        const material = createToonMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(Position.x[eid], height / 2, Position.y[eid]);
        mesh.userData.entityId = eid;
        addOutline(mesh);

        scene.add(mesh);
        entries.set(eid, { type: "pill", eid, mesh });
      }
    }

    for (const eid of modelQuery(world)) {
      const entry = entries.get(eid);
      if (!entry) continue;

      const targetX = Position.x[eid];
      const targetZ = Position.y[eid];

      if (entry.type === "pill") {
        const mesh = entry.mesh;
        const height = Transform.height[eid];

        if (hasComponent(world, eid, Networked)) {
          mesh.position.x += (targetX - mesh.position.x) * 0.2;
          mesh.position.z += (targetZ - mesh.position.z) * 0.2;
        } else {
          mesh.position.x = targetX;
          mesh.position.z = targetZ;
        }
        mesh.position.y = height / 2;
        smoothRotate(
          mesh,
          Transform.rotation[eid],
          Transform.rotationSpeed[eid] ?? 8,
          world.time.delta / 1000,
        );
      } else {
        const group = entry.group;

        if (hasComponent(world, eid, Networked)) {
          group.position.x += (targetX - group.position.x) * 0.2;
          group.position.z += (targetZ - group.position.z) * 0.2;
        } else {
          group.position.x = targetX;
          group.position.z = targetZ;
        }
        smoothRotate(
          group,
          Transform.rotation[eid],
          Transform.rotationSpeed[eid] ?? 8,
          world.time.delta / 1000,
        );
      }
    }

    return world;
  };

  return { run, entries };
};
