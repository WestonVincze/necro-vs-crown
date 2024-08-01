import { addComponent, addEntity } from "bitecs";
import { SpriteTexture } from "../constants";
import { Vector2 } from "../types";
import {
  Collider,
  CollisionLayers,
  DestroyEntity,
  Input,
  MaxMoveSpeed,
  MoveSpeed,
  Position,
  Projectile,
  Sprite,
  SpriteType,
  Transform,
  Velocity,
} from "../components";
import { normalizeForce } from "../helpers";

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
    speed: 5,
    maxSpeed: 8,
    lifetime: 5000,
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

  addComponent(world, Position, eid);
  Position.x[eid] = position.x;
  Position.y[eid] = position.y;

  // add sprite URL
  addComponent(world, Sprite, eid);
  Sprite.texture[eid] =
    SpriteTexture[ProjectileName[name] as keyof typeof SpriteTexture];
  Sprite.type[eid] = SpriteType.Sprite;

  // calculate direction
  const dx = targetPosition.x - position.x - data.width / 2;
  const dy = targetPosition.y - position.y - data.height / 2;
  const normalizedDirection = normalizeForce({ x: dx, y: dy });

  // calculate rotation
  const rotation = Math.atan2(dy, dx);

  addComponent(world, Transform, eid);
  Transform.width[eid] = data.width;
  Transform.height[eid] = data.height;
  Transform.rotation[eid] = rotation;

  addComponent(world, Input, eid);
  Input.moveX[eid] = normalizedDirection.x;
  Input.moveY[eid] = normalizedDirection.y;

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, MoveSpeed, eid);
  MoveSpeed.current[eid] = data.speed;

  addComponent(world, MaxMoveSpeed, eid);
  MaxMoveSpeed.current[eid] = data.speed;

  addComponent(world, DestroyEntity, eid);
  DestroyEntity.timeUntilDestroy[eid] = data.lifetime;

  addComponent(world, Collider, eid);
  Collider.radius[eid] = data.height;
  // TODO: get the Faction of the projectile owner (NECRO is fine for now)
  Collider.collisionLayers[eid] = CollisionLayers.NECRO;
  let baseOffsetX = data.width / 2;
  let baseOffsetY = 0;

  // Apply rotation to the offsets
  Collider.offsetX[eid] =
    baseOffsetX * Math.cos(rotation) - baseOffsetY * Math.sin(rotation);
  Collider.offsetY[eid] =
    baseOffsetX * Math.sin(rotation) + baseOffsetY * Math.cos(rotation);

  addComponent(world, Projectile, eid);
  Projectile.attackBonus[eid] = attackBonus;
  Projectile.damage[eid] = damage;
};
