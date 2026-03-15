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
} from "$components";
import {
  AIState,
  AIType,
  Faction,
  UnitData,
  UnitName,
  type Stats,
} from "$types";
import { Units } from "$data";
import { unitUpgrades } from "$stores";
import { SpriteTexture, BASE_EXP } from "$constants";
import { ProjectileName } from "./Projectiles";
import { clampToScreenSize, getGridCellFromPosition } from "$utils";

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

  addComponent(world, eid, Unit);
  Unit.name[eid] = name;

  if (name !== UnitName.Necromancer) {
    addComponent(world, eid, AI);
    AI.state[eid] = AIState.IDLE;
    AI.type[eid] = AIType.MELEE;
    addComponent(world, eid, Behavior);
    Behavior.type[eid] = Behaviors.AutoTarget;
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
  Collider.ignoreLayers[eid] = CollisionLayers.NECRO;
  Collider.ignoreLayers[eid] = CollisionLayers.CROWN;
  Collider.radius[eid] = data.width / 2;
  Collider.offsetY[eid] = data.height / -2;

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
      break;
    case Faction.Necro:
      addComponent(world, eid, Necro);
      Collider.layer[eid] = CollisionLayers.NECRO;
      break;
  }

  addComponent(world, eid, Input);
  // TODO: add spell data to unit data to avoid this mess
  if (name === UnitName.Paladin) {
    addComponent(world, eid, Spell);
    Spell.state[eid] = SpellState.Ready;
    Spell.name[eid] = SpellName.HolyNova;
    Input.castingSpell[eid] = 1;
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
  addComponent(world, eid, Velocity);

  addComponent(world, eid, Health);
  Health.current[eid] = stats[StatName.MaxHealth];
  Health.max[eid] = stats[StatName.MaxHealth];
  initializeStats(world, eid, stats);

  addComponent(world, eid, Sprite);
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
    addComponent(world, eid, Stat);
    Stat.base[eid] = value;
    Stat.current[eid] = value;
  });
};
