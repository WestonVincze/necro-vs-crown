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
  Transform,
  Collider,
  CollisionLayers,
  Inventory,
  GridCell,
  Spell,
  AI,
  RangedUnit,
  Level,
  UnitMeta,
  Player,
  getStatComponentByName,
  ExpReward,
  ItemDrops,
  SeparationForce,
  Networked,
  AttackCooldown,
  SpellCooldown,
} from "../components";
import {
  Behaviors,
  SpellState,
  SpellName,
  SpriteType,
  StatName,
  SpriteTexture,
  AIState,
  AIType,
  Faction,
  UnitData,
  UnitName,
  type Stats,
  type World,
} from "../types";
import { Units } from "../data";
import { BASE_EXP } from "../constants";
import { ProjectileName } from "./Projectiles";
import { clampToScreenSize, getGridCellFromPosition } from "../utils";

const FIRST_ATTACK_DELAY = 1500;

export const createUnitEntity = (
  world: World,
  name: UnitName,
  x: number,
  y: number,
) => {
  const eid = addEntity(world);
  const data: UnitData = Units[name];
  const stats: Stats = { ...data.stats };

  if (world.unitUpgrades[name]) {
    Object.entries(world.unitUpgrades[name]).forEach(([key, value]) => {
      const statName = key as unknown as keyof Stats;
      if (stats[statName] !== undefined) {
        stats[statName] += value;
      } else {
        stats[statName] = value;
      }
    });
  }

  addComponent(world, eid, UnitMeta);
  UnitMeta.name[eid] = name;

  if (name !== UnitName.Necromancer) {
    addComponent(world, eid, AI);
    AI.state[eid] = AIState.IDLE;
    AI.type[eid] = AIType.MELEE;
    addComponent(world, eid, Behavior);
    Behavior.type[eid] = Behaviors.AutoTarget;
    Behavior.chaseRange[eid] = 0;
    // TODO: add items from drop table
    addComponent(world, eid, ItemDrops);
  } else {
    addComponent(world, eid, Player);
    addComponent(world, eid, Level);
    Level.currentLevel[eid] = 0;
    Level.currentExp[eid] = 0;
    Level.expToNextLevel[eid] = BASE_EXP;
    addComponent(world, eid, Player);
    addComponent(world, eid, Spell);
    Spell.state[eid] = SpellState.Ready;
    Spell.name[eid] = SpellName.Summon;
  }

  if (name === UnitName.Skeleton) {
    addComponent(world, eid, Inventory);
    Collider.collisionLayers[eid] = CollisionLayers.ITEM;
  }

  // TODO: create an enum to define UnitType
  if (name === UnitName.Archer) {
    addComponent(world, eid, RangedUnit);
    RangedUnit.projectileType[eid] = ProjectileName.Arrow;
    RangedUnit.spawnPositionOffsetX[eid] = data.width / -4;
    RangedUnit.spawnPositionOffsetY[eid] = data.height / -2;
  }

  addComponent(world, eid, Collider);
  Collider.radius[eid] = data.width / 2;
  Collider.offsetY[eid] = data.height / -2;
  Collider.offsetX[eid] = 0;

  addComponent(world, eid, SeparationForce);
  SeparationForce.x[eid] = 0;
  SeparationForce.y[eid] = 0;

  if (data.expReward) {
    addComponent(world, eid, ExpReward);
    ExpReward.amount[eid] = data.expReward;
  }

  switch (data.type) {
    case Faction.Crown:
      addComponent(world, eid, Crown);
      Collider.layer[eid] = CollisionLayers.CROWN;
      Collider.ignoreLayers[eid] = CollisionLayers.NECRO;
      break;
    case Faction.Necro:
      addComponent(world, eid, Necro);
      Collider.layer[eid] = CollisionLayers.NECRO;
      Collider.ignoreLayers[eid] = CollisionLayers.CROWN;
      break;
  }

  addComponent(world, eid, Input);
  Input.castingSpell[eid] = 0;
  Input.moveX[eid] = 0;
  Input.moveY[eid] = 0;
  // TODO: add spell data to unit data to avoid this mess
  if (name === UnitName.Paladin) {
    addComponent(world, eid, Spell);
    Spell.state[eid] = SpellState.Ready;
    Spell.name[eid] = SpellName.HolyNova;
    Input.castingSpell[eid] = 1;
    addComponent(world, eid, SpellCooldown);
    SpellCooldown.timeUntilReady[eid] = 3000;
  }

  addComponent(world, eid, Position);
  const position = clampToScreenSize(
    { x, y },
    { width: data.width, height: data.height },
  );
  Position.x[eid] = position.x;
  Position.y[eid] = position.y;
  addComponent(world, eid, GridCell);
  const gridPosition = getGridCellFromPosition(position);
  GridCell.x[eid] = gridPosition.x;
  GridCell.y[eid] = gridPosition.y;
  addComponent(world, eid, Transform);
  Transform.width[eid] = data.width;
  Transform.height[eid] = data.height;
  Transform.rotation[eid] = 0;
  addComponent(world, eid, Velocity);
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;

  addComponent(world, eid, Health);
  Health.current[eid] = stats[StatName.MaxHealth];
  Health.max[eid] = stats[StatName.MaxHealth];
  initializeStats(world, eid, stats);

  addComponent(world, eid, Sprite);
  Sprite.texture[eid] = SpriteTexture[data.name as keyof typeof SpriteTexture];
  Sprite.type[eid] = SpriteType.Rope;

  if (world.networkType === "networked") {
    addComponent(world, eid, Networked);
  }
  // add a buffer before fresh units can attack
  addComponent(world, eid, AttackCooldown);
  AttackCooldown.timeUntilReady[eid] = FIRST_ATTACK_DELAY;
  return eid;
};

/**
 * Dynamically initializes components with base and current values from `Stats`
 */
const initializeStats = (world: World, eid: number, stats: Stats) => {
  Object.entries(stats).forEach(([stat, value]) => {
    const Stat = getStatComponentByName(stat as StatName);
    addComponent(world, eid, Stat);
    Stat.base[eid] = value;
    Stat.current[eid] = value;
  });
};
