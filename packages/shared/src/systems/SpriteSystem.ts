import { GameObjects, Scene } from "phaser";
import { Position, Sprite } from "../components";
import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";

export enum SpriteTexture {
  Necro,
  Skeleton,
  Guard,
  Paladin,
  Archer,
  Doppelsoldner,
}

const Textures = Object.keys(SpriteTexture)
  .filter((key) => isNaN(Number(key)))
  .map((key) => key as keyof typeof SpriteTexture);

/**
 * 
 * @param scene Reference to Phaser Scene
 * @param textures Array of Texture asset names loaded in the Phaser scene - the ID's stored in Scene component should correlate to the array - e.g. ID of "0" represents the first element of the textures array
 */
export const createSpriteSystem = (scene: Scene) => {
  const spritesById = new Map<number, GameObjects.Sprite>();

  const spriteQuery = defineQuery([Position, Sprite]);

  const spriteQueryEnter = enterQuery(spriteQuery);
  const spriteQueryExit = exitQuery(spriteQuery);

  return defineSystem(world => {
    const entitiesEntered = spriteQueryEnter(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const eid = entitiesEntered[i];
      const textureId = Sprite.texture[eid];
      const texture = Textures[textureId];
      const width = Sprite.width[eid];
      const height = Sprite.height[eid];

      const sprite = scene.add.sprite(0, 0, texture);
      sprite.height = width;
      sprite.width = height;
      sprite.displayWidth = width;
      sprite.displayHeight = height;
      spritesById.set(eid, sprite);
    }

    const entities = spriteQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];

      const sprite = spritesById.get(eid);

      if (!sprite) continue;

      sprite.x = Position.x[eid];
      sprite.y = Position.y[eid];
      sprite.depth = Position.y[eid];
    }

    const entitiesExited = spriteQueryExit(world);
    for (let i = 0; i < entitiesExited.length; i++) {
      const eid = entitiesExited[i];

      spritesById.get(eid)?.destroy();
      spritesById.delete(eid);
    }

    return world;
  })
}
