import { addComponent, addEntity, query } from "bitecs";
import * as THREE from "three";
import { Position, type World } from "@necro-crown/shared";
import { applyCameraRig } from "$game/three/CameraRig";

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

export const createCameraFollowSystem = (camera: THREE.OrthographicCamera) => {
  return (world: World) => {
    for (const eid of query(world, [CameraFollow])) {
      const targetEid = CameraFollow.targetEid[eid];
      if (!targetEid) continue;
      const px = Position.x[targetEid];
      const py = Position.y[targetEid];
      if (px === undefined || py === undefined) continue;
      applyCameraRig(camera, px, py);
    }
    return world;
  };
};
