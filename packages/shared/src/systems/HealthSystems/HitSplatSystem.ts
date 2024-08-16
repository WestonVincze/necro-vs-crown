import { hasComponent } from "bitecs";
import { GameObjects, Scene } from "phaser";
import { Necro, Transform } from "$components";
import { gameEvents } from "$events";
import { Faction } from "$types";
import { getPositionFromEid } from "$utils";

const hitSplatColors = {
  [Faction.Crown]: {
    miss: 0xdbaded,
    hit: 0xc360eb,
    crit: 0xab17e6,
  },
  [Faction.Necro]: {
    miss: 0xff9191,
    hit: 0xff5555,
    crit: 0xed2424,
  },
};

export const createHitSplatSystem = (scene: Scene) => {
  return (world: World) => {
    // TODO: this needs to unsubscribe when the scene changes
    gameEvents.healthChanges.subscribe(({ amount, isCrit, eid }) => {
      const tag = hasComponent(world, Necro, eid)
        ? Faction.Necro
        : Faction.Crown;
      const position = getPositionFromEid(eid);
      position.y -= Transform.height[eid] / 2;
      const { x, y } = position;

      let color = hitSplatColors[tag].hit;
      let fontSize = "16px";
      let textAmount = String(Math.abs(amount));

      if (amount === 0) {
        color = hitSplatColors[tag].miss;
      } else if (isCrit) {
        color = hitSplatColors[tag].crit;
        fontSize = "20px";
        textAmount += "!";
      }

      const xVariance = Math.random() * 20 - 10;
      const yVariance = Math.random() * 20 - 10;
      // const star = createRandomStar(scene, x, y, 50, 25);
      const text = new GameObjects.Text(
        scene,
        x + xVariance,
        y + yVariance,
        textAmount,
        {
          color: "#FFF",
          fontFamily: "Wellfleet, monospace",
          fontSize,
        },
      );
      const star = new GameObjects.Star(
        scene,
        x + xVariance,
        y + yVariance,
        12,
        15,
        10,
        color,
      );

      star.depth = 5000;
      text.depth = 5000;
      star.setOrigin(0.5, 0.5);
      text.setOrigin(0.5, 0.5);

      scene.add.existing(star);
      scene.add.existing(text);

      scene.tweens.add({
        targets: [star, text],
        scale: [1.3, 0.8],
        y: y + yVariance - 15,
        x: x + xVariance,
        duration: 500,
        ease: "ease.out",
        paused: false,
      });

      scene.time.delayedCall(500, () => {
        star.destroy();
        text.destroy();
      });
    });

    return world;
  };
};
