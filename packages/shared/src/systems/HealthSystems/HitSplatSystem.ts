import { GameObjects, Scene } from "phaser";

const hitSplatColors = {
  purple: {
    miss: 0xdbaded,
    hit: 0xc360eb,
    crit: 0xab17e6,
  },
  red: {
    miss: 0xff9191,
    hit: 0xff5555,
    crit: 0xed2424,
  },
};

// NOTE: if we want hitsplats to follow the position of its source we'll need to implement a hybrid approach using the old HitSplit component to manage the reference
export const createHitSplatSystem = (world: World, scene: Scene) => {
  world.gameEvents.hitSplat$.subscribe(
    ({ amount, isCrit, position, colorSet }) => {
      const { x, y } = position;

      let color = hitSplatColors[colorSet].hit;
      let fontSize = "16px";
      let textAmount = String(Math.abs(amount));

      if (amount === 0) {
        color = hitSplatColors[colorSet].miss;
      } else if (isCrit) {
        color = hitSplatColors[colorSet].crit;
        fontSize = "20px";
        textAmount += "!";
      }

      const xVariance = Math.random() * 30 - 15;
      const yVariance = Math.random() * 30 - 15;
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

      scene.time.delayedCall(350, () => {
        star.destroy();
        text.destroy();
      });
    },
  );
};
