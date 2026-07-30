import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SpriteTexture } from "@necro-crown/shared";
import { applyToonEffect } from "./ToonShading";

const MODEL_REGISTRY: Partial<Record<SpriteTexture, string>> = {
  [SpriteTexture.Necromancer]: "/models/necro.glb",
  [SpriteTexture.Peasant]: "/models/peasant.glb",
  [SpriteTexture.Skeleton]: "/models/skeleton.glb",
};

interface ModelData {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

// Animation can swing limbs outside the bind-pose bounds, so pad the
// sphere rather than tracking it per frame.
const BOUNDING_SPHERE_PADDING = 1.5;

/**
 * Gives every skinned mesh an explicit bounding sphere.
 *
 * three.js computes a SkinnedMesh's bounding sphere lazily on the first frame
 * it renders, and that computation transforms every vertex by its bones —
 * ~105ms for a 125k-vertex model, which surfaces as a freeze on every spawn.
 * Deriving it once from the (much cheaper) geometry bounds avoids that, and
 * since SkinnedMesh.copy() clones the sphere, every spawned clone inherits it.
 */
const primeBoundingSpheres = (root: THREE.Object3D): void => {
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh;
    if (!mesh.isSkinnedMesh) return;
    const { geometry } = mesh;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    if (!geometry.boundingSphere) return;
    mesh.boundingSphere = geometry.boundingSphere.clone();
    mesh.boundingSphere.radius *= BOUNDING_SPHERE_PADDING;
  });
};

class ModelBank {
  private loader = new GLTFLoader();
  private cache = new Map<SpriteTexture, ModelData | null>();
  ready: Promise<void>;

  constructor() {
    this.ready = this.loadAll();
  }

  private async loadAll() {
    const entries = Object.entries(MODEL_REGISTRY) as [string, string][];
    await Promise.allSettled(
      entries.map(async ([key, path]) => {
        const textureId = Number(key) as SpriteTexture;
        try {
          const gltf = await this.loader.loadAsync(path);
          const model = gltf.scene;
          model.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
              obj.frustumCulled = true;
            }
          });
          applyToonEffect(model);
          // After applyToonEffect so the outline hulls are covered too.
          primeBoundingSpheres(model);
          this.cache.set(textureId, {
            scene: model,
            animations: gltf.animations,
          });
        } catch (err) {
          console.warn(
            `[ModelBank] Failed to load model for texture ${textureId} at "${path}":`,
            err,
          );
          this.cache.set(textureId, null);
        }
      }),
    );
  }

  getModel(textureId: SpriteTexture): ModelData | undefined {
    return this.cache.get(textureId) ?? undefined;
  }

  hasModel(textureId: SpriteTexture): boolean {
    const entry = this.cache.get(textureId);
    return entry !== undefined && entry !== null;
  }

  forEach(fn: (textureId: SpriteTexture, data: ModelData) => void): void {
    this.cache.forEach((data, textureId) => {
      if (data) fn(textureId, data);
    });
  }
}

export const modelBank = new ModelBank();
