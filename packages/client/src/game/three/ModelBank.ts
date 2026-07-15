import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SpriteTexture } from "@necro-crown/shared";

const MODEL_REGISTRY: Partial<Record<SpriteTexture, string>> = {
  [SpriteTexture.Necromancer]: "/models/necro.glb",
};

interface ModelData {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

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
          console.log(gltf.scene);
          model.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
              obj.frustumCulled = true;
            }
          });
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
