import { type IWorld, addComponent, addEntity } from "bitecs"
import { Crown, Input, Necro, Position, Sprite, Velocity, Health } from "../components";
import { Armor, AttackRange, AttackSpeed, CritChance, CritDamage, DamageBonus, MaxHealth, HealthRegeneration, MaxHit, MaxMoveSpeed, MoveSpeed } from "../components/Stats";
import { Faction, type Unit, type UnitData } from "../types";
import { AllUnits } from "../data";
import { SpriteTexture } from "../constants";

export const createUnitEntity = (world: IWorld, name: Unit, x: number, y: number) => {
  const eid = addEntity(world);
  addComponent(world, Input, eid);
  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;
  addComponent(world, Velocity, eid);

  const data = AllUnits[name];
  addComponent(world, Health, eid);
  Health.current[eid] = data.stats.maxHP;
  Health.max[eid] = data.stats.maxHP;
  initializeStats(world, eid, data);

  addComponent(world, Sprite, eid);
  Sprite.texture[eid] = SpriteTexture[data.name as keyof typeof SpriteTexture];
  Sprite.height[eid] = data.height;
  Sprite.width[eid] = data.width;

  switch (data.type) {
    case Faction.Crown:
      addComponent(world, Crown, eid);
      break;
    case Faction.Necro:
      addComponent(world, Necro, eid);
      break;
  }

  return eid;
}

/**
 * Dynamically initializes components with base and current values from `AllUnits`
 */
const initializeStats = (world: IWorld, eid: number, data: UnitData) => {
  addComponent(world, MaxHealth, eid);
  MaxHealth.base[eid] = data.stats.maxHP;
  MaxHealth.current[eid] = data.stats.maxHP;

  addComponent(world, Armor, eid);
  Armor.base[eid] = data.stats.armor;
  Armor.current[eid] = data.stats.armor;

  if (data.stats.HPregeneration) {
    addComponent(world, HealthRegeneration, eid);
    HealthRegeneration.base[eid] = data.stats.HPregeneration;
    HealthRegeneration.current[eid] = data.stats.HPregeneration;
  }

  if (data.stats.moveSpeed) {
    addComponent(world, MoveSpeed, eid);
    MoveSpeed.base[eid] = data.stats.moveSpeed;
    MoveSpeed.current[eid] = data.stats.moveSpeed;
  }

  if (data.stats.maxSpeed) {
    addComponent(world, MaxMoveSpeed, eid);
    MaxMoveSpeed.base[eid] = data.stats.maxSpeed;
    MaxMoveSpeed.current[eid] = data.stats.maxSpeed;
  }

  if (data.stats.attackSpeed) {
    addComponent(world, AttackSpeed, eid);
    AttackSpeed.base[eid] = data.stats.attackSpeed;
    AttackSpeed.current[eid] = data.stats.attackSpeed;
  }

  if (data.stats.attackRange) {
    addComponent(world, AttackRange, eid);
    AttackRange.base[eid] = data.stats.attackRange;
    AttackRange.current[eid] = data.stats.attackRange;
  }

  if (data.stats.maxHit) {
    addComponent(world, MaxHit, eid);
    MaxHit.base[eid] = data.stats.maxHit;
    MaxHit.current[eid] = data.stats.maxHit;
  }

  if (data.stats.damageBonus) {
    addComponent(world, DamageBonus, eid);
    DamageBonus.base[eid] = data.stats.damageBonus;
    DamageBonus.current[eid] = data.stats.damageBonus;
  }

  if (data.stats.critChance) {
    addComponent(world, CritChance, eid);
    CritChance.base[eid] = data.stats.critChance;
    CritChance.current[eid] = data.stats.critChance;
  }

  if (data.stats.critDamage) {
    addComponent(world, CritDamage, eid);
    CritDamage.base[eid] = data.stats.critDamage;
    CritDamage.current[eid] = data.stats.critDamage;
  }
}
