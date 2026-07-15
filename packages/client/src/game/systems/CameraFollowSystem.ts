import { addComponent, addEntity, query } from "bitecs";
import * as THREE from "three";
import { Position, type World } from "@necro-crown/shared";

export const CameraFollow = {
  targetEid: [] as number[],
};

export const createCameraFollowEntity = (
  world: World,
  targetEid: number,
): number => {
  const eid = addEntity(world);
  addComponent(world, eid, CameraFollow);
  CameraFollow.targetEid[eid] = targetEid;
  return eid;
};

export const setCameraTarget = (cameraEid: number, targetEid: number) => {
  CameraFollow.targetEid[cameraEid] = targetEid;
};

export const createCameraFollowSystem = (
  camera: THREE.OrthographicCamera,
  offsetY = 1000,
  offsetZ = 1000,
) => {
  return (world: World) => {
    for (const eid of query(world, [CameraFollow])) {
      const targetEid = CameraFollow.targetEid[eid];
      if (!targetEid) continue;
      const px = Position.x[targetEid];
      const py = Position.y[targetEid];
      if (px === undefined || py === undefined) continue;
      camera.position.set(px, offsetY, py + offsetZ);
      camera.lookAt(px, 0, py);
    }
    return world;
  };
};
