import { IWorld, addComponent, addEntity } from "bitecs";
import { Position, Sprite } from "../components"

export const createItemEntity = (world: IWorld) => {
  const eid = addEntity(world);
  addComponent(world, Position, eid);
  addComponent(world, Sprite, eid);
}
