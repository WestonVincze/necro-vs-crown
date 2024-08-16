import { defineQuery, enterQuery, exitQuery, hasComponent } from "bitecs";
import { GameObjects, Scene } from "phaser";
import { Player, Position, Sprite, SpriteType, Transform } from "$components";
import { TextureNames } from "$constants";

/**
 * @param scene Reference to Phaser Scene
 */
export const createSpriteSystem = (scene: Scene) => {
  const countById = new Map<number, number>();
  const spriteById = new Map<number, GameObjects.Sprite | GameObjects.Rope>();

  const spriteQuery = defineQuery([Position, Sprite]);

  const spriteQueryEnter = enterQuery(
    defineQuery([Position, Transform, Sprite]),
  );
  const spriteQueryExit = exitQuery(defineQuery([Sprite]));

  return (world: World) => {
    for (const eid of spriteQueryEnter(world)) {
      const textureId = Sprite.texture[eid];
      const texture = TextureNames[textureId];
      const width = Transform.width[eid];
      const height = Transform.height[eid];
      const rotation = Transform.rotation[eid];

      let sprite: GameObjects.Sprite | GameObjects.Rope;

      switch (Sprite.type[eid]) {
        case SpriteType.Rope:
          // @ts-expect-error (number can be used to draw vertices)
          sprite = scene.add.rope(400, 350, texture, 0, 6, false);
          spriteById.set(eid, sprite);
          break;
        case SpriteType.Sprite:
        default:
          sprite = scene.add.sprite(0, 0, texture);
          spriteById.set(eid, sprite);
          break;
      }

      if (hasComponent(world, Player, eid)) {
        scene.cameras.main.startFollow(sprite);
      }
      sprite.height = width;
      sprite.width = height;
      sprite.rotation = rotation;
      sprite.displayWidth = width;
      sprite.displayHeight = height;
      countById.set(eid, eid);
    }

    for (const eid of spriteQuery(world)) {
      const x = Position.x[eid];
      const y = Position.y[eid] - Transform.height[eid] / 2;

      const sprite = spriteById.get(eid);
      const count = countById.get(eid) || 0;

      if (!sprite) {
        console.warn(`Sprite not found: Unable to update Sprite for ${eid}.`);
        continue;
      }

      if (Sprite.type[eid] === SpriteType.Rope) {
        const rope = sprite as GameObjects.Rope;

        /** Uses rope to make everything wiggle **/
        if (Math.abs(rope.x - x) > 0.1 || Math.abs(rope.y - y) > 0.1) {
          // sprite has moved at least a little
          let points = rope.points;

          for (let j = 0; j < points.length; j++) {
            if (rope.horizontal) {
              points[j].y = Math.cos(j * 0.4 + count) * 10;
            } else {
              points[j].x = Math.cos(j * 0.4 + count) * 12;
            }
          }

          rope.setDirty();
          countById.set(eid, count + 0.1);
        }
      }

      sprite.x = Position.x[eid];
      sprite.y = Position.y[eid] - Transform.height[eid] / 2;
      // workaround to ensure z-index is always above 0
      sprite.depth = Position.y[eid] + 1200;
    }

    for (const eid of spriteQueryExit(world)) {
      const sprite = spriteById.get(eid);

      if (!sprite) {
        console.warn(`Sprite not found: Unable to destroy Sprite for ${eid}.`);
      } else {
        sprite.destroy();
      }

      spriteById.delete(eid);
    }

    return world;
  };
};
