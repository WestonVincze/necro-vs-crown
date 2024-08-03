import {
  addComponent,
  defineQuery,
  enterQuery,
  exitQuery,
  hasComponent,
  removeComponent,
} from "bitecs";
import { GameObjects, Scene } from "phaser";
import {
  Damage,
  Dead,
  Heal,
  Health,
  Necro,
  Position,
  Transform,
} from "../../components";
import { gameEvents } from "../../events";
import { Faction } from "../../types";
import { getPositionFromEid, profiler } from "../../utils";

const HEALTH_BAR_HEIGHT = 5;

export const createHealthSystem = () => {
  const damageQuery = defineQuery([Health, Damage]);
  const healQuery = defineQuery([Health, Heal]);

  return (world: World) => {
    const damagedEntities = damageQuery(world);
    for (let i = 0; i < damagedEntities.length; i++) {
      const eid = damagedEntities[i];

      if (Damage.amount[eid] < 0) {
        console.warn(`Attempted to damage ${eid} with negative damage.`);
        continue;
      }

      Health.current[eid] = Math.max(
        0,
        Health.current[eid] - Damage.amount[eid],
      );

      gameEvents.emitHealthChange({
        eid,
        amount: Damage.amount[eid],
        isCrit: Damage.isCrit[eid] !== 0,
      });

      removeComponent(world, Damage, eid);

      if (Health.current[eid] <= 0) {
        addComponent(world, Dead, eid);
      }
    }

    const healedEntities = healQuery(world);
    for (let i = 0; i < healedEntities.length; i++) {
      const eid = healedEntities[i];

      if (Heal.amount[eid] < 0) {
        console.warn(`Attempted to heal ${eid} with negative heal.`);
        continue;
      }

      Health.current[eid] = Math.min(
        Health.max[eid],
        Health.current[eid] + Heal.amount[eid],
      );

      removeComponent(world, Heal, eid);
    }

    return world;
  };
};

export const createHealthSystemOld = () => {
  return (world: World) => {
    profiler.start("HEALTH_SYSTEM");
    gameEvents.healthChanges.subscribe(({ eid, amount }) => {
      if (amount > 0) {
        Health.current[eid] = Math.min(
          Health.max[eid],
          Health.current[eid] + amount,
        );
      } else if (amount < 0) {
        Health.current[eid] = Math.max(0, Health.current[eid] + amount);
      }

      if (Health.current[eid] <= 0) {
        gameEvents.emitDeath(eid);
      }
    });

    profiler.end("HEALTH_SYSTEM");
    return world;
  };
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
  };
};

const drawHealthBarGraphic = (
  healthBar: GameObjects.Graphics,
  width: number,
  height: number,
  healthPercentage: number,
) => {
  healthBar.clear();
  healthBar.fillStyle(0xaa5555);
  healthBar.fillRect(0, 0, width, height);

  healthBar.fillStyle(0x55aa55);
  healthBar.fillRect(0, 0, width * healthPercentage, height);
};

const getHealthBarProps = (eid: number) => {
  const x = Position.x[eid] - Transform.width[eid] / 2 + 4;
  const y = Position.y[eid] - Transform.height[eid] - HEALTH_BAR_HEIGHT * 2;
  const width = Transform.width[eid] - 8;
  const height = HEALTH_BAR_HEIGHT;
  return { x, y, width, height };
};

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
