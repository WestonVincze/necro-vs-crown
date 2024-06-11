import { defineQuery, defineSystem, enterQuery, exitQuery, removeEntity } from "bitecs"
import { Health, Position, Transform } from "../components";
import { GameObjects, Scene } from "phaser";
import { healthChanges, onDeath } from "../subjects";

const HEALTH_BAR_HEIGHT = 5;

export const createHealthSystem = () => {
  return defineSystem(world => {
    healthChanges.subscribe(({ eid, amount }) => {
      if (amount > 0) {
        Health.current[eid] = Math.min(Health.max[eid], Health.current[eid] + amount);
      } else if (amount < 0) {
        Health.current[eid] = Math.max(0, Health.current[eid] + amount);
      }

      // spawn hit splat

      if (Health.current[eid] <= 0) {
        onDeath.next({ eid });
        removeEntity(world, eid);
      }
    })
    return world;
  })
};

export const createHealthBarSystem = (scene: Scene) => {
  const healthBarsById = new Map<number, GameObjects.Graphics>();
  const healthQuery = defineQuery([Health, Position, Transform]);
  const onEnterQuery = enterQuery(healthQuery);
  const onExitQuery = exitQuery(healthQuery);

  return defineSystem(world => {
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
      healthBar?.setDepth(Position.y[eid]);

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
  })
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
  const y = Position.y[eid] - (Transform.height[eid] / 2) - HEALTH_BAR_HEIGHT * 2;
  const width = Transform.width[eid] - 8;
  const height = HEALTH_BAR_HEIGHT;
  return { x, y, width, height };
}
