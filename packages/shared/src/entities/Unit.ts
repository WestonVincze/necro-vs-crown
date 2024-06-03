import { type IWorld, addComponent, addEntity } from "bitecs"
import { Position, Sprite, Target, Velocity } from "../components";
import { Armor, AttackRange, AttackSpeed, CritChance, CritDamage, DamageBonus, Health, HealthRegeneration, MaxHit, MaxMoveSpeed, MoveSpeed } from "../components/Stats";
import { Faction } from "../types";

export const createUnitEntity = (world: IWorld, type: Faction) => {
  const eid = addEntity(world);
  addComponent(world, Position, eid);
  addComponent(world, Velocity, eid);
  addComponent(world, Target, eid);
  addComponent(world, Sprite, eid);

  initializeStats(world, eid);

  // add tag?

  return eid;
}

const initializeStats = (world: IWorld, eid: number) => {
  addComponent(world, Health, eid);
  addComponent(world, Armor, eid);
  addComponent(world, HealthRegeneration, eid);
  addComponent(world, MoveSpeed, eid);
  addComponent(world, MaxMoveSpeed, eid);
  addComponent(world, AttackSpeed, eid);
  addComponent(world, AttackRange, eid);
  addComponent(world, MaxHit, eid);
  addComponent(world, DamageBonus, eid);
  addComponent(world, CritChance, eid);
  addComponent(world, CritDamage, eid);
  addComponent(world, CritDamage, eid);
}
