import { addComponent, addComponents, addEntity } from "bitecs";
import {
  Armor,
  AttackBonus,
  AttackRange,
  AttackSpeed,
  Behavior,
  Crown,
  Health,
  MaxHealth,
  MaxHit,
  Networked,
  Player,
  Position,
  RangedUnit,
  Sprite,
  Transform,
} from "../components";
import { ProjectileName } from "./Projectiles";
import { createUnitEntity } from "./Unit";
import { Behaviors, SpriteType, SpriteTexture, UnitName } from "../types";

export const createArcherTower = (world: World, x: number, y: number) => {
  const eid = addEntity(world);

  addComponents(world, eid, [
    Crown,
    Player,
    Position,
    Transform,
    RangedUnit,
    AttackBonus,
    AttackSpeed,
    AttackRange,
    MaxHit,
    MaxHealth,
    Armor,
    Health,
    Behavior,
    Sprite,
  ]);

  Position.x[eid] = x;
  Position.y[eid] = y;

  Transform.height[eid] = 200;
  Transform.width[eid] = 100;
  Transform.rotation[eid] = 0;

  RangedUnit.projectileType[eid] = ProjectileName.Arrow;
  RangedUnit.spawnPositionOffsetX[eid] = 0;
  RangedUnit.spawnPositionOffsetY[eid] = 0;

  AttackBonus.current[eid] = 10;
  AttackBonus.base[eid] = 10;

  AttackSpeed.current[eid] = 10;
  AttackSpeed.base[eid] = 10;

  AttackRange.current[eid] = 500;
  AttackRange.base[eid] = 500;

  MaxHit.current[eid] = 120;
  MaxHit.base[eid] = 120;

  Armor.current[eid] = 18;
  Armor.base[eid] = 18;

  MaxHealth.current[eid] = 2500;
  MaxHealth.base[eid] = 2500;

  Health.current[eid] = 2500;
  Health.max[eid] = 2500;

  Behavior.type[eid] = Behaviors.Stationary;

  Sprite.height[eid] = 200;
  Sprite.width[eid] = 100;
  Sprite.texture[eid] = SpriteTexture["Tower"];
  Sprite.type[eid] = SpriteType.Rope;

  if (world.networkType === "networked") {
    addComponent(world, eid, Networked);
  }
  return eid;
};

export const createPeasantHut = (world: World, x: number, y: number) => {
  const eid = addEntity(world);
  addComponent(world, eid, Position);
  Position.x[eid] = x;
  Position.y[eid] = y;

  addComponent(world, eid, Transform);
  Transform.height[eid] = 150;
  Transform.width[eid] = 150;
  Transform.rotation[eid] = 0;

  addComponent(world, eid, Sprite);
  Sprite.height[eid] = 150;
  Sprite.width[eid] = 150;
  Sprite.texture[eid] = SpriteTexture.Hut;
  Sprite.type[eid] = SpriteType.Sprite;

  // spawn 3 peasants within 200 units of hut
  for (let i = 0; i < 3; i++) {
    const eid = createUnitEntity(
      world,
      UnitName.Peasant,
      x + (Math.random() * 200 - 100),
      y + (Math.random() * 200 - 100),
    );
    // distance calc uses position squared
    Behavior.chaseRange[eid] = 250 ** 2;
  }
};
