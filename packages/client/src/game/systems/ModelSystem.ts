import { query, observe, onAdd, onRemove, hasComponent } from "bitecs";
import * as THREE from "three";
import {
  Networked,
  Position,
  Sprite,
  Transform,
  type World,
  SpriteTexture,
} from "@necro-crown/shared";

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

export const createModelSystem = (world: World, scene: THREE.Scene) => {
  const meshById = new Map<number, THREE.Mesh>();

  const modelQuery = (world: World) => query(world, [Position, Sprite]);

  const enterQueue: number[] = [];
  observe(world, onAdd(Position, Transform, Sprite), (eid) =>
    enterQueue.push(eid),
  );

  const exitQueue: number[] = [];
  observe(world, onRemove(Sprite), (eid) => exitQueue.push(eid));

  return (world: World) => {
    const exited = exitQueue.splice(0);
    for (const eid of exited) {
      const mesh = meshById.get(eid);
      if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      meshById.delete(eid);
    }

    const entered = enterQueue.splice(0);
    for (const eid of entered) {
      const textureId = Sprite.texture[eid];
      const width = Math.max(Transform.width[eid], 1);
      const height = Math.max(Transform.height[eid], 1);
      const color = TEXTURE_COLORS[textureId as SpriteTexture] ?? 0x888888;

      let geometry: THREE.BufferGeometry;
      if (height > width || SpriteTexture[textureId] !== "bones") {
        const radius = width / 2;
        const capsuleLength = height - width;
        geometry = new THREE.CapsuleGeometry(radius, capsuleLength, 8, 12);
      } else {
        geometry = new THREE.SphereGeometry(width / 2, 12, 8);
      }

      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.6,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(Position.x[eid], height / 2, Position.y[eid]);
      mesh.userData.entityId = eid;

      scene.add(mesh);
      meshById.set(eid, mesh);
    }

    for (const eid of modelQuery(world)) {
      const mesh = meshById.get(eid);
      if (!mesh) continue;

      const targetX = Position.x[eid];
      const targetZ = Position.y[eid];
      const height = Transform.height[eid];

      if (hasComponent(world, eid, Networked)) {
        mesh.position.x += (targetX - mesh.position.x) * 0.2;
        mesh.position.z += (targetZ - mesh.position.z) * 0.2;
      } else {
        mesh.position.x = targetX;
        mesh.position.z = targetZ;
      }

      mesh.position.y = height / 2;
    }

    return world;
  };
};
