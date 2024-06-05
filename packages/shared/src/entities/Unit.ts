import { type IWorld, addComponent, addEntity, hasComponent } from "bitecs"
import { Crown, Input, Necro, Position, Sprite, Velocity } from "../components";
import { Armor, AttackRange, AttackSpeed, CritChance, CritDamage, DamageBonus, Health, HealthRegeneration, MaxHit, MaxMoveSpeed, MoveSpeed } from "../components/Stats";
import { Faction } from "../types";

export const createUnitEntity = (world: IWorld, type: Faction) => {
  const eid = addEntity(world);
  addComponent(world, Input, eid);
  addComponent(world, Position, eid);
  addComponent(world, Velocity, eid);
  addComponent(world, Sprite, eid);

  initializeStats(world, eid);

  switch (type) {
    case Faction.Crown:
      addComponent(world, Crown, eid);
      break;
    case Faction.Necro:
      addComponent(world, Necro, eid);
      break;
  }

  return eid;
}

// TODO: dynamically populate stats component based on UnitData
// should values be initialized here as well?
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

  // temporary hard coded values for testing
  Health.current[eid] = 10;
  Armor.current[eid] = 10;
  HealthRegeneration.current[eid] = 0.2;
  MoveSpeed.current[eid] = 1;
  MaxMoveSpeed.current[eid] = 1.5;
  AttackSpeed.current[eid] = 1;
  AttackRange.current[eid] = 1;
  MaxHit.current[eid] = 1;
  DamageBonus.current[eid] = 1;
  CritChance.current[eid] = 1;
  CritDamage.current[eid] = 1;
}
