import { SpriteTexture } from "../constants";
import { Vector2 } from "../types";
import { Projectile, Sprite } from "../components";
import { addComponent, addEntity } from "bitecs"

export enum ProjectileName {
  Arrow
}

interface ProjectileProps {
  speed: number;
  lifetime: number;
}

const ProjectileData: Record<ProjectileName, ProjectileProps> = {
  [ProjectileName.Arrow]: {
    speed: 10,
    lifetime: 5,
  }
}

export const createProjectileEntity = (world: World, name: ProjectileName, position: Vector2, onCollide: (target: number) => void) => {
  // get projectile data from name
  // - sprite URL
  const eid = addEntity(world);

  addComponent(world, Projectile, eid);
  Projectile.speed[eid] = ProjectileData[name].speed;
  Projectile.lifetime[eid] = ProjectileData[name].lifetime;
  addComponent(world, Sprite, eid);
  Sprite.texture[eid] = SpriteTexture[ProjectileName[name]as keyof typeof SpriteTexture]
  // add sprite URL

}
