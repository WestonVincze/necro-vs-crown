import { addComponent, addComponents, addEntity } from "bitecs";
import {
  AttackBonus,
  AttackRange,
  AttackSpeed,
  Behavior,
  Behaviors,
  Crown,
  Health,
  MaxHealth,
  MaxHit,
  Networked,
  Player,
  Position,
  RangedUnit,
  Sprite,
  SpriteType,
  Transform,
} from "../components";
import { ProjectileName } from "./Projectiles";
import { SpriteTexture } from "../constants";

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

  Health.current[eid] = 2500;
  Health.max[eid] = 2500;

  Behavior.type[eid] = Behaviors.AutoTarget;

  Sprite.height[eid] = 200;
  Sprite.width[eid] = 100;
  Sprite.texture[eid] = SpriteTexture["Tower"];
  Sprite.type[eid] = SpriteType.Rope;

  if (world.networkType === "networked") {
    addComponent(world, eid, Networked);
  }
};
