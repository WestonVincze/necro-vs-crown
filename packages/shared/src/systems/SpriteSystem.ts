import { GameObjects, Scene } from "phaser";
import { Position, Sprite } from "../components";
import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";

export default function createSpriteSystem(scene: Scene, textures: string[]) {
  const spritesById = new Map<number, GameObjects.Sprite>();

  const spriteQuery = defineQuery([Position, Sprite]);

  const spriteQueryEnter = enterQuery(spriteQuery);
  const spriteQueryExit = exitQuery(spriteQuery);

  return defineSystem(world => {
    const entitiesEntered = spriteQueryEnter(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const eid = entitiesEntered[i];
      const textureId = Sprite.texture[eid];
      const texture = textures[textureId];

      const sprite = scene.add.sprite(0, 0, texture);
      sprite.height = 80;
      sprite.width = 40;
      sprite.displayHeight = 80;
      sprite.displayWidth = 40;
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

      spritesById.delete(eid);
    }

    return world;
  })

}