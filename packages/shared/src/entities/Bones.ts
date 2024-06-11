import { type IWorld, addComponent, addEntity } from "bitecs";
import { Bones, Collider, CollisionLayers, Position, Sprite, Transform } from "../components";
import { SpriteTexture } from "../constants";

const BONE_LIFETIME = 15000;

export const createBonesEntity = (world: IWorld, x: number, y: number) => {
  const eid = addEntity(world);

  addComponent(world, Bones, eid);
  addComponent(world, Position, eid);
  addComponent(world, Sprite, eid);
  addComponent(world, Transform, eid);
  addComponent(world, Collider, eid);

  // Bones.duration[eid] = BONE_LIFETIME;
  Position.x[eid] = x;
  Position.y[eid] = y;

  Sprite.texture[eid] = SpriteTexture.Bones;
  Transform.width[eid] = 50;
  Transform.height[eid] = 30;

  Collider.radius[eid] = 50;
  Collider.layer[eid] = CollisionLayers.BONES;
}
