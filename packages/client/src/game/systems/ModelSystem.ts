import { observe, onAdd, onRemove, hasComponent, query } from "bitecs";
import * as THREE from "three";
import {
  Networked,
  Position,
  Sprite,
  Transform,
  Velocity,
  MaxMoveSpeed,
  type World,
  SpriteTexture,
} from "@necro-crown/shared";
import { modelBank } from "$game/three/ModelBank";

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

interface PillEntry {
  type: "pill";
  mesh: THREE.Mesh;
}

interface ModelEntry {
  type: "model";
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  idleAction: THREE.AnimationAction | null;
  walkActions: THREE.AnimationAction[] | null;
}

type Entry = PillEntry | ModelEntry;

export const createModelSystem = (world: World, scene: THREE.Scene) => {
  const entries = new Map<number, Entry>();

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
      const entry = entries.get(eid);
      if (entry) {
        scene.remove(entry.type === "pill" ? entry.mesh : entry.group);
        if (entry.type === "pill") {
          entry.mesh.geometry.dispose();
          (entry.mesh.material as THREE.Material).dispose();
        } else {
          entry.mixer.stopAllAction();
          entry.group.traverse((child) => {
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
        group.scale.set(15, 15, 15);
        group.userData.entityId = eid;
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.frustumCulled = false;
            child.matrixAutoUpdate = true;
            if (child.material instanceof THREE.Material) {
              (child.material as THREE.Material).side = THREE.DoubleSide;
            } else if (Array.isArray(child.material)) {
              child.material.forEach((m) => (m.side = THREE.DoubleSide));
            }
            if (child instanceof THREE.SkinnedMesh) {
              child.normalizeSkinWeights();
              // Remap skeleton bones to cloned bone instances
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

        const mixer = new THREE.AnimationMixer(group);
        let idleAction: THREE.AnimationAction | null = null;
        let walkActions: THREE.AnimationAction[] | null = null;

        const meshInfo: string[] = [];
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material;
            const matName =
              mat instanceof THREE.Material
                ? (mat as THREE.Material).name || "unnamed"
                : "array";
            const typeName =
              child instanceof THREE.SkinnedMesh ? "SkinnedMesh" : "Mesh";
            const sideName =
              mat instanceof THREE.Material
                ? (mat as THREE.Material).side
                : "?";
            meshInfo.push(
              `${child.name} (${typeName}, side=${sideName}, verts=${child.geometry.attributes.position.count}, mat="${matName}")`,
            );
          }
        });
        console.log("[ModelSystem] model meshes:", meshInfo);
        console.log(
          "[ModelSystem] animations:",
          modelData.animations.map((a) => a.name),
        );

        if (modelData.animations.length > 0) {
          const idleClip = modelData.animations.find((a) =>
            /idle/i.test(a.name),
          );
          const walkClip = modelData.animations.filter((a) =>
            /walk|run/i.test(a.name),
          );

          if (idleClip) {
            idleAction = mixer.clipAction(idleClip);
            idleAction.play();
            idleAction.setEffectiveWeight(1);
          }
          if (walkClip) {
            walkActions = [];
            for (const action in walkClip) {
              walkActions.push(mixer.clipAction(walkClip[action]));
              walkActions[action].play();
              walkActions[action].setEffectiveWeight(0);
            }
          }
        }

        entries.set(eid, {
          type: "model",
          group,
          mixer,
          idleAction,
          walkActions,
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
        entries.set(eid, { type: "pill", mesh });
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

        // animate
        if (entry.walkActions && entry.idleAction) {
          const vx = Velocity.x[eid] ?? 0;
          const vy = Velocity.y[eid] ?? 0;
          const speed = Math.sqrt(vx * vx + vy * vy);
          const maxSpeed = MaxMoveSpeed.current[eid] ?? 1;
          const blend = Math.min(speed / maxSpeed, 1);

          entry.idleAction.setEffectiveWeight(1 - blend);
          for (const action of entry.walkActions) {
            action.setEffectiveWeight(blend);
          }
        }

        const delta = world.time.delta / 1000;
        entry.mixer.update(delta);
      }
    }

    return world;
  };
};
