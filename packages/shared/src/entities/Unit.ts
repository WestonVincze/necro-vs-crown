import { addComponent, addEntity } from "bitecs"
import { Crown, Input, Necro, Position, Sprite, Velocity, Health, Behavior, Behaviors, Transform, Collider, CollisionLayers, Inventory, GridCell, Spell, SpellState, SpellName, AI, RangedUnit, SpriteType } from "../components";
import { Armor, AttackRange, AttackSpeed, CritChance, CritDamage, DamageBonus, MaxHealth, HealthRegeneration, MaxHit, MaxMoveSpeed, MoveSpeed } from "../components/Stats";
import { AIState, AIType, Faction, type Stats, type Unit } from "../types";
import { AllUnits } from "../data";
import { SpriteTexture } from "../constants";
import { ProjectileName } from "./Projectiles";

export const createUnitEntity = (world: World, name: Unit, x: number, y: number) => {
  const eid = addEntity(world);
  const data = AllUnits[name];

  if (name !== "Necromancer") {
    addComponent(world, AI, eid);
    AI.state[eid] = AIState.IDLE;
    AI.type[eid] = AIType.MELEE;
    addComponent(world, Behavior, eid);
    Behavior.type[eid] = Behaviors.AutoTarget;
  }

  if (name === "Skeleton") {
    addComponent(world, Inventory, eid);
    Collider.collisionLayers[eid] = CollisionLayers.ITEM;
  }

  // TODO: create an enum to define UnitType
  if (name === "Archer") {
    addComponent(world, RangedUnit, eid);
    RangedUnit.projectileType[eid] = ProjectileName.Arrow;
  }

  addComponent(world, Collider, eid);
  Collider.ignoreLayers[eid] = CollisionLayers.NECRO;
  Collider.ignoreLayers[eid] = CollisionLayers.CROWN;

  switch (data.type) {
    case Faction.Crown:
      addComponent(world, Crown, eid);
      Collider.layer[eid] = CollisionLayers.CROWN;
      break;
    case Faction.Necro:
      addComponent(world, Necro, eid);
      Collider.layer[eid] = CollisionLayers.NECRO;
      break;
  }

  addComponent(world, Input, eid);
  // TODO: add spell data to unit data to avoid this mess
  if (name === "Paladin") {
    addComponent(world, Spell, eid);
    Spell.state[eid] = SpellState.Ready;
    Spell.name[eid] = SpellName.HolyNova;
    Input.castingSpell[eid] = 1;
  }

  addComponent(world, Position, eid);
  Position.x[eid] = x;
  Position.y[eid] = y;
  addComponent(world, GridCell, eid);
  addComponent(world, Transform, eid);
  Transform.width[eid] = data.width;
  Transform.height[eid] = data.height;
  addComponent(world, Velocity, eid);

  addComponent(world, Health, eid);
  Health.current[eid] = data.stats.maxHP;
  Health.max[eid] = data.stats.maxHP;
  initializeStats(world, eid, data.stats);

  addComponent(world, Sprite, eid);
  Sprite.texture[eid] = SpriteTexture[data.name as keyof typeof SpriteTexture];
  Sprite.type[eid] = SpriteType.Rope;

  return eid;
}

/**
 * Dynamically initializes components with base and current values from `AllUnits`
 */
const initializeStats = (world: World, eid: number, stats: Stats) => {
  addComponent(world, MaxHealth, eid);
  MaxHealth.base[eid] = stats.maxHP;
  MaxHealth.current[eid] = stats.maxHP;

  addComponent(world, Armor, eid);
  Armor.base[eid] = stats.armor;
  Armor.current[eid] = stats.armor;

  if (stats.HPregeneration) {
    addComponent(world, HealthRegeneration, eid);
    HealthRegeneration.base[eid] = stats.HPregeneration;
    HealthRegeneration.current[eid] = stats.HPregeneration;
  }

  if (stats.moveSpeed) {
    addComponent(world, MoveSpeed, eid);
    MoveSpeed.base[eid] = stats.moveSpeed;
    MoveSpeed.current[eid] = stats.moveSpeed;
  }

  if (stats.maxSpeed) {
    addComponent(world, MaxMoveSpeed, eid);
    MaxMoveSpeed.base[eid] = stats.maxSpeed;
    MaxMoveSpeed.current[eid] = stats.maxSpeed;
  }

  if (stats.attackSpeed) {
    addComponent(world, AttackSpeed, eid);
    AttackSpeed.base[eid] = stats.attackSpeed;
    AttackSpeed.current[eid] = stats.attackSpeed;
  }

  if (stats.attackRange) {
    addComponent(world, AttackRange, eid);
    AttackRange.base[eid] = stats.attackRange;
    AttackRange.current[eid] = stats.attackRange;
  }

  if (stats.maxHit) {
    addComponent(world, MaxHit, eid);
    MaxHit.base[eid] = stats.maxHit;
    MaxHit.current[eid] = stats.maxHit;
  }

  if (stats.damageBonus) {
    addComponent(world, DamageBonus, eid);
    DamageBonus.base[eid] = stats.damageBonus;
    DamageBonus.current[eid] = stats.damageBonus;
  }

  if (stats.critChance) {
    addComponent(world, CritChance, eid);
    CritChance.base[eid] = stats.critChance;
    CritChance.current[eid] = stats.critChance;
  }

  if (stats.critDamage) {
    addComponent(world, CritDamage, eid);
    CritDamage.base[eid] = stats.critDamage;
    CritDamage.current[eid] = stats.critDamage;
  }
}
