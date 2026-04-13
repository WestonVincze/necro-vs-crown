import { addComponent, addEntity } from "bitecs";
import {
  Bones,
  GridCell,
  Networked,
  Position,
  Sprite,
  Transform,
} from "../components";
import { clampToScreenSize, getGridCellFromPosition } from "../utils";
import { type World, SpriteTexture, SpriteType } from "../types";

const BONE_LIFETIME = 15000;

export const createBonesEntity = (world: World, x: number, y: number) => {
  const eid = addEntity(world);
  const position = clampToScreenSize({ x, y }, { width: 50, height: 50 });

  addComponent(world, eid, Bones);
  addComponent(world, eid, Position);
  addComponent(world, eid, Sprite);
  addComponent(world, eid, Transform);

  // Bones.duration[eid] = BONE_LIFETIME;
  Position.x[eid] = position.x;
  Position.y[eid] = position.y;
  const gridCoordinates = getGridCellFromPosition(position);
  GridCell.x[eid] = gridCoordinates.x;
  GridCell.y[eid] = gridCoordinates.y;

  Sprite.texture[eid] = SpriteTexture.Bones;
  Sprite.type[eid] = SpriteType.Sprite;
  Transform.width[eid] = 50;
  Transform.height[eid] = 30;
  Transform.rotation[eid] = 0;

  /* collider not being use at the moment
  addComponent(world, eid, Collider);
  Collider.radius[eid] = 50;
  Collider.layer[eid] = CollisionLayers.BONES;
  Collider.ignoreLayers[eid] = CollisionLayers.BONES;
  */

  if (world.networkType === "networked") {
    addComponent(world, eid, Networked);
  }
  return eid;
};
