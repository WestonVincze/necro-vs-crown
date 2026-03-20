import { addComponent, hasComponent, removeEntity } from "bitecs";
import { Item, Equipped, Inventory } from "../components";

import { collisionEvents } from "./CollisionSystems";

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
        hasComponent(world, eid1, Item) &&
        hasComponent(world, eid2, Inventory)
      ) {
        equipItem(world, eid2, eid1);
      } else if (
        hasComponent(world, eid2, Item) &&
        hasComponent(world, eid1, Inventory)
      ) {
        equipItem(world, eid1, eid2);
      }
    });

    return world;
  };
};

const equipItem = (world: World, entity: number, item: number) => {
  const itemId = Item.itemId[item];

  // Get item effects from the itemEffects map
  // const effects = itemEffects[itemId];

  Inventory.slot[entity] = itemId;

  // Mark item as equipped
  addComponent(world, entity, Equipped);
  Equipped.itemId[entity] = itemId;

  // Remove item from the world (and all components)

  removeEntity(world, item);
};
