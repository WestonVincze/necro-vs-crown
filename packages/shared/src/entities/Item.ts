import { type IWorld, addComponent, addEntity } from "bitecs";
import { Collider, CollisionLayers, Item, Position, Sprite } from "../components"

export const createItemEntity = (world: IWorld, x: number, y: number, itemId: number) => {
  const eid = addEntity(world);
  addComponent(world, Position, eid);
  addComponent(world, Item, eid);
  addComponent(world, Sprite, eid);
  addComponent(world, Collider, eid);

  Position.x[eid] = x;
  Position.y[eid] = y;
  Item.itemId[eid] = itemId;
  Collider.layer[eid] = CollisionLayers.ITEM;
  Collider.radius[eid] = 50;
  Sprite.texture[eid] = 2;
  Sprite.width[eid] = 50;
  Sprite.height[eid] = 50;

  return eid;
}
