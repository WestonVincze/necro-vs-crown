import { defineQuery, enterQuery, exitQuery, hasComponent } from "bitecs"
import { GameObjects, Scene } from "phaser";
import { Health, Necro, Position, Transform } from "../components";
import { gameEvents } from "../events";
import { Faction } from "../types";
import { getPositionFromEid } from "../utils";

const HEALTH_BAR_HEIGHT = 5;

export const createHealthSystem = () => {
  return (world: World) => {
    gameEvents.healthChanges.subscribe(({ eid, amount }) => { 
        if (amount > 0) {
          Health.current[eid] = Math.min(Health.max[eid], Health.current[eid] + amount);
        } else if (amount < 0) {
          Health.current[eid] = Math.max(0, Health.current[eid] + amount);
        }

        if (Health.current[eid] <= 0) {
          gameEvents.emitDeath(eid)
        }
    })

    return world;
  }
};

export const createHealthBarSystem = (scene: Scene) => {
  const healthBarsById = new Map<number, GameObjects.Graphics>();
  const healthQuery = defineQuery([Health, Position, Transform]);
  const onEnterQuery = enterQuery(healthQuery);
  const onExitQuery = exitQuery(healthQuery);

  return (world: World) => {
    for (const eid of onEnterQuery(world)) {
      const { x, y, width, height } = getHealthBarProps(eid);

      // create graphics reference for healthBar
      const healthBar = scene.add.graphics();
      healthBar.setPosition(x, y);

      drawHealthBarGraphic(healthBar, width, height, 1);

      healthBarsById.set(eid, healthBar);
    }

    for (const eid of healthQuery(world)) {
      const healthBar = healthBarsById.get(eid);

      if (!healthBar) {
        console.warn(`Not found: could not update HealthBar for ${eid}`);
        continue;
      }

      const { x, y, width, height } = getHealthBarProps(eid);

      healthBar?.setPosition(x, y);
      healthBar?.setDepth(Position.y[eid] + 1200);

      const healthPercent = Health.current[eid] / Health.max[eid];

      drawHealthBarGraphic(healthBar, width, height, healthPercent);
      // sync healthBar with health 
      //scene.add.rectangle
    }

    for (const eid of onExitQuery(world)) {
      const healthBar = healthBarsById.get(eid);

      if (!healthBar) {
        console.warn(`Not found: could not destroy HealthBar for ${eid}`);
      }

      healthBar?.destroy();
      healthBarsById.delete(eid);
    }

    return world;
  }
};

const drawHealthBarGraphic = (healthBar: GameObjects.Graphics, width: number, height: number, healthPercentage: number) => {
  healthBar.clear();
  healthBar.fillStyle(0xAA5555);
  healthBar.fillRect(0, 0, width, height);

  healthBar.fillStyle(0x55AA55);
  healthBar.fillRect(0, 0, width * healthPercentage, height);
}

const getHealthBarProps = (eid: number) => {
  const x = Position.x[eid] - (Transform.width[eid] / 2) + 4;
  const y = Position.y[eid] - (Transform.height[eid]) - HEALTH_BAR_HEIGHT * 2;
  const width = Transform.width[eid] - 8;
  const height = HEALTH_BAR_HEIGHT;
  return { x, y, width, height };
}

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
  }
}

export const createHitSplatSystem = (scene: Scene) => {
  return (world: World) => {
    // TODO: this needs to unsubscribe when the scene changes
    gameEvents.healthChanges.subscribe(({ amount, isCrit, eid}) => {
      const tag = hasComponent(world, Necro, eid) ? Faction.Necro : Faction.Crown
      const position = getPositionFromEid(eid);
      position.y -= Transform.height[eid] / 2;
      const { x, y } = position;

      let color = hitSplatColors[tag].hit;
      let fontSize = "16px"
      let textAmount = String(Math.abs(amount));

      if (amount === 0) {
        color = hitSplatColors[tag].miss;
      } else if (isCrit) {
        color = hitSplatColors[tag].crit;
        fontSize = "20px";
        textAmount += "!";
      }

      const xVariance = (Math.random() * 20) - 10;
      const yVariance = (Math.random() * 20) - 10;
      // const star = createRandomStar(scene, x, y, 50, 25);
      const text = new GameObjects.Text(
        scene,
        x + xVariance,
        y + yVariance,
        textAmount,
        {
          color: '#FFF',
          fontFamily: 'Wellfleet, monospace',
          fontSize,
        }
      );
      const star = new GameObjects.Star(
        scene,
        x + xVariance,
        y + yVariance,
        12,
        15,
        10,
        color
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
      })

      scene.time.delayedCall(500, () => {
        star.destroy();
        text.destroy();
      })
    })
    return world;
  }
}
