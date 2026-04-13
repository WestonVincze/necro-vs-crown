import {
  addComponent,
  addComponents,
  addEntity,
  createWorld,
  entityExists,
  getAllEntities,
  hasComponent,
  query,
} from "bitecs";
import { beforeEach, describe, expect, it } from "vitest";
import {
  Bones,
  Crown,
  Dead,
  Experience,
  ExpReward,
  ItemDrops,
  Necro,
  Player,
  Position,
} from "../../components";
import { createDeathSystem } from "./DeathSystem";
import { Faction } from "../../types";

describe("DeathSystem", () => {
  let world: World;
  let deathSystem: (world: World) => World;
  let eid: number;

  beforeEach(() => {
    world = createWorld();
    deathSystem = createDeathSystem(world, Faction.Necro);
    eid = addEntity(world);
    addComponent(world, eid, Dead);
  });

  it("removes [Dead] entities", () => {
    expect(entityExists(world, eid)).toBe(true);
    deathSystem(world);
    expect(entityExists(world, eid)).toBe(false);
  });

  it("adds [Experience] to enemy players", () => {
    const player = addEntity(world);
    addComponent(world, player, Player);
    addComponent(world, player, Necro);

    addComponent(world, eid, ExpReward);
    ExpReward.amount[eid] = 50;
    addComponent(world, eid, Crown);

    deathSystem(world);

    expect(hasComponent(world, player, Experience)).toBe(true);
    expect(Experience.amount[player]).toBe(50);
  });

  it("creates [Bones] when a [Crown] unit dies", () => {
    addComponent(world, eid, Crown);
    addComponent(world, eid, ItemDrops);
    addComponent(world, eid, Position);
    Position.x[eid] = 50;
    Position.y[eid] = 50;

    deathSystem(world);

    const bones = query(world, [Bones]);
    expect(bones.length).toBeGreaterThan(0);
    expect(Position.x[bones[0]]).toBe(50);
    expect(Position.y[bones[0]]).toBe(50);
  });

  it("should handle multiple deaths at once", () => {
    const player = addEntity(world);
    addComponents(world, player, [Player, Necro]);
    let entities = [];

    for (let i = 0; i < 100; i++) {
      const entity = addEntity(world);
      entities.push(entity);
      addComponents(world, entity, [Dead, ExpReward, Crown]);
      ExpReward.amount[entity] = 10;
    }

    expect(getAllEntities(world).length).toBe(102);

    deathSystem(world);

    for (const eid of entities) {
      expect(!entityExists(world, eid));
    }
    expect(Experience.amount[player]).toBe(1000);
  });
});
