import { addComponent, hasComponent, removeEntity } from "bitecs";
import { Item, Equipped, Inventory } from "../components";

import { collisionEvents } from "./CollisionSystem";

const itemEffects = {
  1: {
    // Item ID
    damage: 5,
    defense: 2,
    healthBoost: 10,
  },
  2: {
    // Another Item ID
    damage: 10,
    defense: 5,
    healthBoost: 20,
  },
  // Add more items as needed
};

export const createItemEquipSystem = () => {
  // TODO: map item stats to stat components and update base / current values
  return (world: World) => {
    collisionEvents.subscribe(({ eid1, eid2 }) => {
      if (
        hasComponent(world, Item, eid1) &&
        hasComponent(world, Inventory, eid2)
      ) {
        equipItem(world, eid2, eid1);
      } else if (
        hasComponent(world, Item, eid2) &&
        hasComponent(world, Inventory, eid1)
      ) {
        equipItem(world, eid1, eid2);
      }
    });

    return world;
  };
};

const equipItem = (world: World, entity: number, item: number) => {
  console.log(`${entity} is equipping ${item}`);
  const itemId = Item.itemId[item];

  // Get item effects from the itemEffects map
  // const effects = itemEffects[itemId];

  Inventory.slot[entity] = itemId;

  // Mark item as equipped
  addComponent(world, Equipped, entity);
  Equipped.itemId[entity] = itemId;

  // Remove item from the world (and all components)

  removeEntity(world, item);
};
