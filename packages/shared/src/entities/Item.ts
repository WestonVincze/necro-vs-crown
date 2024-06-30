import { type World as IWorld, addComponent, addEntity } from "bitecs";
import { Collider, CollisionLayers, Item, Position, Sprite, Transform } from "../components"
import { SpriteTexture } from "../constants";

export const createItemEntity = (world: IWorld, x: number, y: number, itemId: number) => {
  const eid = addEntity(world);
  addComponent(world, Position, eid);
  addComponent(world, Item, eid);
  addComponent(world, Sprite, eid);
  addComponent(world, Transform, eid);
  addComponent(world, Collider, eid);

  Position.x[eid] = x;
  Position.y[eid] = y;
  Item.itemId[eid] = itemId;
  Collider.layer[eid] = CollisionLayers.ITEM;
  Collider.collisionLayers[eid] = CollisionLayers.NECRO;
  // Collider.ignoreLayers[eid] = CollisionLayers.ITEM;
  Collider.radius[eid] = 50;
  Sprite.texture[eid] = SpriteTexture.MedHelm;
  Transform.width[eid] = 50;
  Transform.height[eid] = 50;

  return eid;
}
