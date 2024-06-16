import { GameObjects, Scene } from "phaser";
import { Player, Position, Sprite, Transform } from "../components";
import { TextureNames } from "../constants";
import { defineQuery, defineSystem, enterQuery, exitQuery, hasComponent } from "bitecs";

/**
 * @param scene Reference to Phaser Scene
 */
export const createSpriteSystem = (scene: Scene) => {
  const spritesById = new Map<number, GameObjects.Rope>();
  const countById = new Map<number, number>();
  // const spritesById = new Map<number, GameObjects.Sprite>();

  const spriteQuery = defineQuery([Position, Sprite]);

  const spriteQueryEnter = enterQuery(defineQuery([Position, Transform, Sprite]));
  const spriteQueryExit = exitQuery(defineQuery([Sprite]));

  return defineSystem(world => {
    const entitiesEntered = spriteQueryEnter(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const eid = entitiesEntered[i];
      const textureId = Sprite.texture[eid];
      const texture = TextureNames[textureId];
      const width = Transform.width[eid];
      const height = Transform.height[eid];

      // @ts-expect-error (number can be used to draw vertices)
      const sprite = scene.add.rope(400, 350, texture, 0, 6, false)

      if (hasComponent(world, Player, eid)) {
        scene.cameras.main.startFollow(sprite);
      }
      // const sprite = scene.add.sprite(0, 0, texture);
      sprite.height = width;
      sprite.width = height;
      sprite.displayWidth = width;
      sprite.displayHeight = height;
      spritesById.set(eid, sprite);
      countById.set(eid, eid);
    }

    const entities = spriteQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];

      const sprite = spritesById.get(eid);
      const count = countById.get(eid) || 0;

      if (!sprite) {
        console.warn(`Sprite not found: Unable to update Sprite for ${eid}.`)
        continue;
      }

      /** Uses rope to make everything wiggle **/
      if (Math.abs(sprite.x - Position.x[eid]) > 0.1 || Math.abs(sprite.y - Position.y[eid]) > 0.1) {
        // sprite has moved at least a little
        let points = sprite.points;

        for (let j = 0; j < points.length; j++) {
          if (sprite.horizontal) {
            points[j].y = Math.cos(j * 0.4 + count) * 10;
          } else {
            points[j].x = Math.cos(j * 0.4 + count) * 12;
          }
        }

        sprite.setDirty();
        countById.set(eid, count + 0.1);
      }

      sprite.x = Position.x[eid];
      sprite.y = Position.y[eid];
      sprite.depth = Position.y[eid];
    }

    const entitiesExited = spriteQueryExit(world);
    for (let i = 0; i < entitiesExited.length; i++) {
      const eid = entitiesExited[i];

      const sprite = spritesById.get(eid);

      if (!sprite) {
        console.warn(`Sprite not found: Unable to destroy Sprite for ${eid}.`)
      } else {
        sprite.destroy();
      }
      
      spritesById.delete(eid);
    }

    return world;
  })
}
