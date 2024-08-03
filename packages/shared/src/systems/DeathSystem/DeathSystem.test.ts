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

describe("DeathSystem", () => {
  let world: World;
  let deathSystem: (world: World) => World;
  let eid: number;

  beforeEach(() => {
    world = createWorld();
    deathSystem = createDeathSystem();
    eid = addEntity(world);
    addComponent(world, Dead, eid);
  });

  it("removes [Dead] entities", () => {
    expect(entityExists(world, eid)).toBe(true);
    deathSystem(world);
    expect(entityExists(world, eid)).toBe(false);
  });

  it("adds [Experience] to enemy players", () => {
    const player = addEntity(world);
    addComponent(world, Player, player);
    addComponent(world, Necro, player);

    addComponent(world, ExpReward, eid);
    ExpReward.amount[eid] = 50;
    addComponent(world, Crown, eid);

    deathSystem(world);

    expect(hasComponent(world, Experience, player)).toBe(true);
    expect(Experience.amount[player]).toBe(50);
  });

  it("creates [Bones] when a [Crown] unit dies", () => {
    addComponent(world, Crown, eid);
    addComponent(world, ItemDrops, eid);
    addComponent(world, Position, eid);
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
    addComponents(world, [Player, Necro], player);

    for (let i = 0; i < 1000; i++) {
      const entity = addEntity(world);
      addComponents(world, [Dead, ExpReward, Crown], entity);
      ExpReward.amount[entity] = 10;
    }

    expect(getAllEntities(world).length).toBe(1002);

    deathSystem(world);

    expect(getAllEntities(world).length).toBe(1);
    expect(Experience.amount[player]).toBe(10000);
  });

  it("should handle ");
});
