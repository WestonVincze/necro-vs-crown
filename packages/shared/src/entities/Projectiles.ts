import { SpriteTexture } from "../constants";
import { Vector2 } from "../types";
import { Input, MaxMoveSpeed, MoveSpeed, Projectile, Sprite, Velocity } from "../components";
import { addComponent, addEntity } from "bitecs"
import { normalizeForce } from "$helpers";

export enum ProjectileName {
  Arrow
}

interface ProjectileProps {
  speed: number;
  maxSpeed: number;
  lifetime: number;
}

const ProjectileData: Record<ProjectileName, ProjectileProps> = {
  [ProjectileName.Arrow]: {
    speed: 1,
    maxSpeed: 2,
    lifetime: 5,
  }
}

export const createProjectileEntity = (world: World, name: ProjectileName, position: Vector2, targetPosition: Vector2, onCollide: (target: number) => void) => {
  // get projectile data from name
  const eid = addEntity(world);
  const data = ProjectileData[name];

  // add sprite URL
  addComponent(world, Sprite, eid);
  Sprite.texture[eid] = SpriteTexture[ProjectileName[name]as keyof typeof SpriteTexture]

  // calculate direction
  const dx = targetPosition.x - position.x;
  const dy = targetPosition.y - position.y;
  const normalizedDirection = normalizeForce({ x: dx, y: dy });

  addComponent(world, Input, eid);
  Input.moveX[eid] = normalizedDirection.x;
  Input.moveY[eid] = normalizedDirection.y;

  addComponent(world, Velocity, eid);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, MoveSpeed, eid);
  MoveSpeed.current[eid] = data.speed;

  addComponent(world, MaxMoveSpeed, eid);
  MoveSpeed.current[eid] = data.speed;
}
