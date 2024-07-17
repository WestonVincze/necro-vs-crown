import { defineEnterQueue, defineQuery, enterQuery } from "bitecs";
import { Projectile, Sprite } from "../components";

/**
 * do we need a system at all?
 * SpriteSystem renders sprite
 * ColliderSystem handles collisions
 * MoveSystem moves the arrow
 *
 * create a "LifetimeSystem" that can be used by any entity that needs to be deleted after a set time and we can use this to limit the projectiles
 *
 *
 */

export const createProjectileSystem = () => {
  const projectileQuery = defineQuery([Projectile]);
  const projectileEnterQueue = defineEnterQueue(projectileQuery);

  return (world: World) => {
    for (const eid of projectileEnterQueue(world)) {
      // create collider and attach callback
    }

    for (const eid of projectileQuery(world)) {
      //
    }
  };
};
