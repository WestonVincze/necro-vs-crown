import { addComponent, addEntity } from "bitecs";
import {
  Crown,
  Input,
  Necro,
  Position,
  Sprite,
  Velocity,
  Health,
  Behavior,
  Behaviors,
  Transform,
  Collider,
  CollisionLayers,
  Inventory,
  GridCell,
  Spell,
  SpellState,
  SpellName,
  AI,
  RangedUnit,
  SpriteType,
  Level,
  Unit,
  Player,
  StatName,
  getStatComponentByName,
  ExpReward,
  ItemDrops,
  SeparationForce,
} from "../components";
import {
  AIState,
  AIType,
  Faction,
  UnitData,
  UnitName,
  type Stats,
} from "../types";
import { Units } from "../data";
import { unitUpgrades } from "../stores";
import { SpriteTexture, BASE_EXP } from "../constants";
import { ProjectileName } from "./Projectiles";

export const createUnitEntity = (
  world: World,
  name: UnitName,
  x: number,
  y: number,
) => {
  const eid = addEntity(world);
  const data: UnitData = Units[name];
  const stats: Stats = { ...data.stats };

  if (unitUpgrades[name]) {
    Object.entries(unitUpgrades[name]).forEach(([key, value]) => {
      const statName = key as unknown as keyof Stats;
      if (stats[statName] !== undefined) {
        stats[statName] += value;
      } else {
        stats[statName] = value;
      }
    });
  }

  addComponent(world, Unit, eid);
  Unit.name[eid] = name;

  if (name !== UnitName.Necromancer) {
    addComponent(world, AI, eid);
    AI.state[eid] = AIState.IDLE;
    AI.type[eid] = AIType.MELEE;
    addComponent(world, Behavior, eid);
    Behavior.type[eid] = Behaviors.AutoTarget;
    // TODO: add items from drop table
    addComponent(world, ItemDrops, eid);
  } else {
    addComponent(world, Player, eid);
    addComponent(world, Level, eid);
    Level.currentLevel[eid] = 0;
    Level.currentExp[eid] = 0;
    Level.expToNextLevel[eid] = BASE_EXP;
    addComponent(world, Player, eid);
    addComponent(world, Spell, eid);
    Spell.state[eid] = SpellState.Ready;
    Spell.name[eid] = SpellName.Summon;
  }

  if (name === UnitName.Skeleton) {
    addComponent(world, Inventory, eid);
    Collider.collisionLayers[eid] = CollisionLayers.ITEM;
  }

  // TODO: create an enum to define UnitType
  if (name === UnitName.Archer) {
    addComponent(world, RangedUnit, eid);
    RangedUnit.projectileType[eid] = ProjectileName.Arrow;
    RangedUnit.spawnPositionOffsetX[eid] = data.width / -4;
    RangedUnit.spawnPositionOffsetY[eid] = data.height / -2;
  }

  addComponent(world, Collider, eid);
  Collider.ignoreLayers[eid] = CollisionLayers.NECRO;
  Collider.ignoreLayers[eid] = CollisionLayers.CROWN;
  Collider.radius[eid] = data.width / 2;
  Collider.offsetY[eid] = data.height / -2;

  addComponent(world, SeparationForce, eid);
  SeparationForce.x[eid] = 0;
  SeparationForce.y[eid] = 0;

  if (data.expReward) {
    addComponent(world, ExpReward, eid);
    ExpReward.amount[eid] = data.expReward;
  }

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
  if (name === UnitName.Paladin) {
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
  Health.current[eid] = stats[StatName.MaxHealth];
  Health.max[eid] = stats[StatName.MaxHealth];
  initializeStats(world, eid, stats);

  addComponent(world, Sprite, eid);
  Sprite.texture[eid] = SpriteTexture[data.name as keyof typeof SpriteTexture];
  Sprite.type[eid] = SpriteType.Rope;

  return eid;
};

/**
 * Dynamically initializes components with base and current values from `Stats`
 */
const initializeStats = (world: World, eid: number, stats: Stats) => {
  Object.entries(stats).forEach(([stat, value]) => {
    const Stat = getStatComponentByName(parseInt(stat) as StatName);
    addComponent(world, Stat, eid);
    Stat.base[eid] = value;
    Stat.current[eid] = value;
  });
};
