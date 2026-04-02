import { query, hasComponent, observe, onAdd, onRemove } from "bitecs";
import { GameObjects, Scene } from "phaser";
import {
  Networked,
  Player,
  Position,
  Sprite,
  SpriteType,
  Transform,
  TextureNames,
  type World,
  MAP_HEIGHT_PIXELS,
  Necro,
  Faction,
} from "@necro-crown/shared";

/**
 * @param scene Reference to Phaser Scene
 */
export const createSpriteSystem = (
  world: World,
  scene: Scene,
  faction?: Faction,
) => {
  const countById = new Map<number, number>();
  const spriteById = new Map<number, GameObjects.Sprite | GameObjects.Rope>();

  const spriteQuery = (world: World) => query(world, [Position, Sprite]);

  const spriteEnterQueue: number[] = [];
  observe(world, onAdd(Position, Transform, Sprite), (eid) =>
    spriteEnterQueue.push(eid),
  );

  const spriteExitQueue: number[] = [];
  observe(world, onRemove(Sprite), (eid) => spriteExitQueue.push(eid));

  return (world: World) => {
    const spritesExited = spriteExitQueue.splice(0);
    for (const eid of spritesExited) {
      const sprite = spriteById.get(eid);

      if (!sprite) {
        console.warn(`Sprite not found: Unable to destroy Sprite for ${eid}.`);
      } else {
        sprite.destroy();
      }

      spriteById.delete(eid);
    }

    const spritesEntered = spriteEnterQueue.splice(0);
    for (const eid of spritesEntered) {
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

      sprite.x = Position.x[eid];
      sprite.y = Position.y[eid] - Transform.height[eid] / 2;
      sprite.width = width;
      sprite.displayWidth = width;
      sprite.height = height;
      sprite.displayHeight = height;
      sprite.rotation = rotation;
      countById.set(eid, eid);

      if (
        faction === Faction.Necro &&
        hasComponent(world, eid, Player) &&
        hasComponent(world, eid, Necro)
      ) {
        const camera = scene.cameras.main;
        scene.tweens.add({
          targets: camera,
          delay: 500,
          duration: 1500,
          scrollX: 0 - camera.width / 2,
          scrollY: 1600 - Transform.height[eid] / 2 - camera.height / 2,
          ease: "Cubic.easeInOut",
          paused: false,
          onComplete: () => {
            camera.startFollow(sprite);
          },
        });
      }
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
        if (Math.abs(rope.x - x) > 1 || Math.abs(rope.y - y) > 1) {
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

      // linear interpolation for networked entities
      if (hasComponent(world, eid, Networked)) {
        sprite.x = Phaser.Math.Linear(sprite.x, Position.x[eid], 0.2);
        sprite.y = Phaser.Math.Linear(
          sprite.y,
          Position.y[eid] - Transform.height[eid] / 2,
          0.2,
        );
      } else {
        sprite.x = Position.x[eid];
        sprite.y = Position.y[eid] - Transform.height[eid] / 2;
      }
      // workaround to ensure z-index is always above 0
      sprite.depth = Position.y[eid] + MAP_HEIGHT_PIXELS / 2;
    }

    return world;
  };
};
