import { addComponent, addEntity } from "bitecs";
import { SpriteTexture } from "../constants";
import type { Vector2, World } from "../types";
import {
  Collider,
  CollisionLayers,
  DestroyEntity,
  Input,
  MaxMoveSpeed,
  MoveSpeed,
  Networked,
  Position,
  Projectile,
  Sprite,
  SpriteType,
  Transform,
  Velocity,
} from "../components";
import { normalizeForce } from "../utils";

export enum ProjectileName {
  Arrow,
}

interface ProjectileProps {
  speed: number;
  maxSpeed: number;
  lifetime: number;
  width: number;
  height: number;
}

const ProjectileData: Record<ProjectileName, ProjectileProps> = {
  [ProjectileName.Arrow]: {
    speed: 8,
    maxSpeed: 10,
    lifetime: 750,
    width: 50,
    height: 12,
  },
};

export const createProjectileEntity = (
  world: World,
  name: ProjectileName,
  position: Vector2,
  targetPosition: Vector2,
  attackBonus: number,
  damage: number,
) => {
  // get projectile data from name
  const eid = addEntity(world);
  const data = ProjectileData[name];

  addComponent(world, eid, Position);
  Position.x[eid] = position.x;
  Position.y[eid] = position.y;

  // add sprite URL
  addComponent(world, eid, Sprite);
  Sprite.texture[eid] =
    SpriteTexture[ProjectileName[name] as keyof typeof SpriteTexture];
  Sprite.type[eid] = SpriteType.Sprite;

  // calculate direction
  const dx = targetPosition.x - position.x - data.width / 2;
  const dy = targetPosition.y - position.y - data.height / 2;
  const normalizedDirection = normalizeForce({ x: dx, y: dy });

  // calculate rotation
  const rotation = Math.atan2(dy, dx);

  addComponent(world, eid, Transform);
  Transform.width[eid] = data.width;
  Transform.height[eid] = data.height;
  Transform.rotation[eid] = rotation;

  addComponent(world, eid, Input);
  Input.moveX[eid] = normalizedDirection.x;
  Input.moveY[eid] = normalizedDirection.y;

  addComponent(world, eid, Velocity);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, eid, MoveSpeed);
  MoveSpeed.current[eid] = data.speed;

  addComponent(world, eid, MaxMoveSpeed);
  MaxMoveSpeed.current[eid] = data.speed;

  addComponent(world, eid, DestroyEntity);
  DestroyEntity.timeUntilDestroy[eid] = data.lifetime;

  addComponent(world, eid, Collider);
  Collider.radius[eid] = data.height;
  // TODO: get the Faction of the projectile owner (NECRO is fine for now)
  Collider.collisionLayers[eid] = CollisionLayers.NECRO;
  Collider.ignoreLayers[eid] = CollisionLayers.DEFAULT;
  let baseOffsetX = data.width / 2;
  let baseOffsetY = 0;

  // Apply rotation to the offsets
  Collider.offsetX[eid] =
    baseOffsetX * Math.cos(rotation) - baseOffsetY * Math.sin(rotation);
  Collider.offsetY[eid] =
    baseOffsetX * Math.sin(rotation) + baseOffsetY * Math.cos(rotation);

  addComponent(world, eid, Projectile);
  Projectile.attackBonus[eid] = attackBonus;
  Projectile.damage[eid] = damage;

  if (world.networkType === "networked") {
    addComponent(world, eid, Networked);
  }
};
