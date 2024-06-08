/**
 * handle taking damage
 * handle death
 * 
 * show healthBar
 */

import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { Health, Position } from "../components";
import { GameObjects, Scene } from "phaser";

export const createHealthBarSystem = (scene: Scene) => {
  const healthBarsById = new Map<number, GameObjects.Rectangle>();
  const healthQuery = defineQuery([Health, Position]);
  const onEnterQuery = enterQuery(healthQuery);
  const onExitQuery = exitQuery(healthQuery);

  return defineSystem(world => {
    const entitiesEntered = healthQuery(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const eid = entitiesEntered[i];

      // instantiate healthBar
    }

    const entities = healthQuery(world);

    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      // sync healthBar with health 
      //scene.add.rectangle
    }

    return world;
  })
};
