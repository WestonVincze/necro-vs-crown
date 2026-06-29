import * as THREE from "three";

export interface ThreeContext {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  groundPlane: THREE.Plane;
  resize: () => void;
  dispose: () => void;
}

export const createThreeScene = (container: HTMLElement): ThreeContext => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const aspect = container.clientWidth / container.clientHeight;
  const frustumSize = 1500;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    5000,
  );
  camera.position.set(0, 1000, 1000);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(500, 1000, 500);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 3000;
  directionalLight.shadow.camera.left = -2000;
  directionalLight.shadow.camera.right = 2000;
  directionalLight.shadow.camera.top = 2000;
  directionalLight.shadow.camera.bottom = -2000;
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-300, 500, -300);
  scene.add(fillLight);

  const groundGeometry = new THREE.PlaneGeometry(4000, 5000);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d4a2d,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 2048 / 2);
  ground.receiveShadow = true;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(4000, 64, 0x444444, 0x333333);
  gridHelper.position.set(0, 0.5, 2048 / 2);
  scene.add(gridHelper);

  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const newAspect = width / height;

    camera.left = (frustumSize * newAspect) / -2;
    camera.right = (frustumSize * newAspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  };

  const dispose = () => {
    renderer.dispose();
    scene.clear();
  };

  return { scene, camera, renderer, groundPlane, resize, dispose };
};
