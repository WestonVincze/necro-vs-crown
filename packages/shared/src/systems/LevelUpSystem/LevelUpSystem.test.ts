import { addComponent, addEntity, createWorld, hasComponent } from "bitecs";
import { describe, expect, it } from "vitest";
import { Experience, Level } from "../../components";
import {
  createLevelUpSystem,
  getExpForNextLevel,
  giveExpToEntity,
  MAX_LEVEL,
} from "./LevelUpSystem";

describe("LevelUpSystem", () => {
  describe("createLevelUpSystem", () => {
    it("should add experience to Level and remove Experience", () => {
      const world: World = createWorld();

      const player = addEntity(world);

      const expToLevelUp = getExpForNextLevel(0);
      addComponent(world, Level, player);
      Level.currentExp[player] = 0;
      Level.currentLevel[player] = 0;
      Level.expToNextLevel[player] = expToLevelUp;

      addComponent(world, Experience, player);
      Experience.amount[player] = 9;

      const levelUpSystem = createLevelUpSystem();

      levelUpSystem(world);

      expect(Level.currentLevel[player]).toBe(0);
      expect(Level.currentExp[player]).toBe(9);
      expect(hasComponent(world, Experience, player)).toBe(false);
    });

    it("should level up when currentExp reaches expToNextLevel", () => {
      const world: World = createWorld();

      const player = addEntity(world);

      const expToLevelUp = getExpForNextLevel(0);
      addComponent(world, Level, player);
      Level.currentExp[player] = 0;
      Level.currentLevel[player] = 0;
      Level.expToNextLevel[player] = expToLevelUp;

      addComponent(world, Experience, player);
      Experience.amount[player] = expToLevelUp;

      const levelUpSystem = createLevelUpSystem();

      levelUpSystem(world);

      expect(Level.currentLevel[player]).toBe(1);
      expect(Level.currentExp[player]).toBe(0);
    });

    it("should carry over remaining exp to currentExp after a level up", () => {
      const world: World = createWorld();

      const player = addEntity(world);

      let expToLevelUp = getExpForNextLevel(0);
      addComponent(world, Level, player);
      Level.currentExp[player] = 0;
      Level.currentLevel[player] = 0;
      Level.expToNextLevel[player] = expToLevelUp;

      addComponent(world, Experience, player);
      Experience.amount[player] = expToLevelUp + 5;

      const levelUpSystem = createLevelUpSystem();

      levelUpSystem(world);

      expect(Level.currentLevel[player]).toBe(1);
      expect(Level.currentExp[player]).toBe(5);

      expToLevelUp = getExpForNextLevel(1);
      addComponent(world, Experience, player);
      Experience.amount[player] = expToLevelUp + 5;

      levelUpSystem(world);

      expect(Level.currentLevel[player]).toBe(2);
      expect(Level.currentExp[player]).toBe(10);
    });

    it("should stop incrementing level up at max level", () => {
      const world: World = createWorld();

      const player = addEntity(world);

      let expToLevelUp = getExpForNextLevel(MAX_LEVEL);
      addComponent(world, Level, player);
      Level.currentExp[player] = 0;
      Level.currentLevel[player] = MAX_LEVEL;
      Level.expToNextLevel[player] = expToLevelUp;

      addComponent(world, Experience, player);
      Experience.amount[player] = 5000;

      const levelUpSystem = createLevelUpSystem();

      levelUpSystem(world);

      expect(Level.currentLevel[player]).toBe(MAX_LEVEL);
      expect(Level.currentExp[player]).toBe(5000);
    });
  });

  describe("addExpToEntity", () => {
    it("should create add an Experience component to an existing entity", () => {
      const world: World = createWorld();
      const eid = addEntity(world);

      giveExpToEntity(world, eid, 9);
      expect(hasComponent(world, Experience, eid)).toBe(true);
      expect(Experience.amount[eid]).toBe(9);
    });

    it("should gracefully handle adding Experience to a non-existent entity", () => {
      const world: World = createWorld();

      giveExpToEntity(world, 0, 9);
      expect(Experience.amount[0]).toBe(0);
    });

    /* well... maybe it should?
    it("should not add Experience to an entity that is already at max level", () => {
      const world: World = createWorld();
      const eid = addEntity(world);
      addComponent(world, Level, eid);
      Level.currentLevel[eid] = MAX_LEVEL;

      giveExpToEntity(world, eid, 1);
      expect(hasComponent(world, Experience, eid)).toBe(false);
    });
    */
  });
});
