import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { Health, Position, Sprite } from "../components";
import { GameObjects, Scene } from "phaser";

const HEALTH_BAR_HEIGHT = 5;

export const createHealthBarSystem = (scene: Scene) => {
  const healthBarsById = new Map<number, GameObjects.Graphics>();
  const healthQuery = defineQuery([Health, Position, Sprite]);
  const onEnterQuery = enterQuery(healthQuery);
  const onExitQuery = exitQuery(healthQuery);

  return defineSystem(world => {
    const entitiesEntered = onEnterQuery(world);
    for (let i = 0; i < entitiesEntered.length; i++) {
      const eid = entitiesEntered[i];

      const { x, y, width, height } = getHealthBarProps(eid);

      // create graphics reference for healthBar
      const healthBar = scene.add.graphics();
      healthBar.setPosition(x, y);

      drawHealthBarGraphic(healthBar, width, height, 1);

      healthBarsById.set(eid, healthBar);
    }

    const entities = healthQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];

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

    const entitiesExited = onExitQuery(world);
    for (let i = 0; i < entitiesExited.length; i++) {
      const eid = entitiesExited[i];

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
  const x = Position.x[eid] - (Sprite.width[eid] / 2) + 4;
  const y = Position.y[eid] - (Sprite.height[eid] / 2) - HEALTH_BAR_HEIGHT * 2;
  const width = Sprite.width[eid] - 8;
  const height = HEALTH_BAR_HEIGHT;
  return { x, y, width, height };
}
