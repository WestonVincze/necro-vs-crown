import * as THREE from "three";

/**
 * Cartoon look for models: hard-stepped toon lighting plus an
 * inverted-hull outline (a back-facing copy of the mesh pushed out
 * along its normals, rendered solid black).
 */

const DEFAULT_OUTLINE_WIDTH = 0.025;
const OUTLINE_COLOR = 0x000000;

// Luminance steps for the toon gradient, skewed bright so lit faces pop.
const GRADIENT_STEPS = new Uint8Array([110, 190, 255]);

let gradientMap: THREE.DataTexture | null = null;

export const getToonGradientMap = (): THREE.DataTexture => {
  if (!gradientMap) {
    gradientMap = new THREE.DataTexture(
      GRADIENT_STEPS,
      GRADIENT_STEPS.length,
      1,
      THREE.RedFormat,
    );
    // Nearest filtering keeps the bands hard instead of blending them.
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
};

export const createToonMaterial = (
  params?: THREE.MeshToonMaterialParameters,
): THREE.MeshToonMaterial =>
  new THREE.MeshToonMaterial({ gradientMap: getToonGradientMap(), ...params });

const toToonMaterial = (source: THREE.Material): THREE.MeshToonMaterial => {
  const src = source as THREE.MeshStandardMaterial;
  const toon = createToonMaterial();
  if (src.color) toon.color.copy(src.color);
  if (src.map) toon.map = src.map;
  toon.transparent = src.transparent;
  toon.opacity = src.opacity;
  toon.alphaTest = src.alphaTest;
  toon.vertexColors = src.vertexColors;
  toon.side = src.side;
  toon.name = src.name;
  return toon;
};

const createOutlineMaterial = (thickness: number): THREE.MeshBasicMaterial => {
  const material = new THREE.MeshBasicMaterial({
    color: OUTLINE_COLOR,
    side: THREE.BackSide,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uOutlineThickness = { value: thickness };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uOutlineThickness;",
      )
      // Push vertices outward in object space; for skinned meshes the
      // offset happens before skinning so it follows the bones.
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\ntransformed += normal * uOutlineThickness;",
      );
  };
  return material;
};

/**
 * Adds a black inverted-hull outline as a child of the mesh.
 * `width` is relative to the mesh's bounding-sphere radius, so the
 * outline reads equally thick on models of different sizes.
 */
export const addOutline = (
  mesh: THREE.Mesh,
  width: number = DEFAULT_OUTLINE_WIDTH,
): THREE.Mesh => {
  const geometry = mesh.geometry;
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  const thickness = (geometry.boundingSphere?.radius ?? 1) * width;
  const material = createOutlineMaterial(thickness);

  let outline: THREE.Mesh;
  if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
    const skinned = mesh as THREE.SkinnedMesh;
    const skinnedOutline = new THREE.SkinnedMesh(geometry, material);
    skinnedOutline.bindMode = skinned.bindMode;
    skinnedOutline.bind(skinned.skeleton, skinned.bindMatrix);
    outline = skinnedOutline;
  } else {
    outline = new THREE.Mesh(geometry, material);
  }

  outline.name = `${mesh.name}__outline`;
  outline.userData.isOutline = true;
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.frustumCulled = mesh.frustumCulled;
  mesh.add(outline);
  return outline;
};

/**
 * Converts every mesh under `root` to toon shading and gives it an
 * outline. Intended to run once on a freshly loaded model; clones of
 * the result keep the effect.
 */
export const applyToonEffect = (
  root: THREE.Object3D,
  outlineWidth: number = DEFAULT_OUTLINE_WIDTH,
): void => {
  const converted = new Map<THREE.Material, THREE.MeshToonMaterial>();
  const convert = (m: THREE.Material): THREE.MeshToonMaterial => {
    let toon = converted.get(m);
    if (!toon) {
      toon = toToonMaterial(m);
      converted.set(m, toon);
      m.dispose();
    }
    return toon;
  };

  // Collect first: addOutline mutates the tree mid-traverse otherwise.
  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && !mesh.userData.isOutline) meshes.push(mesh);
  });

  for (const mesh of meshes) {
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert)
      : convert(mesh.material);
    addOutline(mesh, outlineWidth);
  }
};
