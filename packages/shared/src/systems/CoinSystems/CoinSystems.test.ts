import { beforeEach, describe, expect, it } from "vitest";
import { addComponents, addEntity, createWorld, hasComponent } from "bitecs";
import { CoinAccumulator, Coin, AddCoin, SpendCoin } from "../../components";
import { createCoinAccumulationSystem, createCoinSystem } from "./CoinSystems";

describe("CoinSystems", () => {
  let world: World;
  let eid: number;
  const coinAccumulationSystem = createCoinAccumulationSystem();
  const coinSystem = createCoinSystem();

  beforeEach(() => {
    world = createWorld();
    world.time = {
      delta: 1,
      then: 0,
      elapsed: 0,
    };
    eid = addEntity(world);
  });

  describe("CoinAccumulationSystem", () => {
    beforeEach(() => {
      addComponents(world, [Coin, CoinAccumulator], eid);
    });

    it("increases [Coins] by [CoinAccumulator] amount and sets timeUntilNextPay", () => {
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;
      CoinAccumulator.amount[eid] = 1;
      CoinAccumulator.timeUntilNextPay[eid] = 1;

      expect(hasComponent(world, AddCoin, eid)).toBe(false);

      coinAccumulationSystem(world);

      expect(hasComponent(world, AddCoin, eid)).toBe(true);

      expect(AddCoin.amount[eid]).toBe(1);
      expect(CoinAccumulator.timeUntilNextPay[eid]).toBe(
        CoinAccumulator.frequency[eid],
      );
    });

    it("works with multiple [CoinAccumulator]'s", () => {
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;
      CoinAccumulator.amount[eid] = 1;
      CoinAccumulator.timeUntilNextPay[eid] = 1;

      coinAccumulationSystem(world);
      coinAccumulationSystem(world);
      coinAccumulationSystem(world);

      expect(AddCoin.amount[eid]).toBe(3);
      expect(CoinAccumulator.timeUntilNextPay[eid]).toBe(
        CoinAccumulator.frequency[eid],
      );
    });

    it("does nothing if [CoinAccumulator] timeUntilNextPay is not ready", () => {
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;
      CoinAccumulator.amount[eid] = 1;
      CoinAccumulator.timeUntilNextPay[eid] = 100;

      coinAccumulationSystem(world);

      expect(hasComponent(world, AddCoin, eid)).toBe(false);
      expect(CoinAccumulator.timeUntilNextPay[eid]).toBe(99);
    });
  });

  describe("CoinSystem", () => {
    it("handles [AddCoin] requests", () => {
      addComponents(world, [Coin, AddCoin], eid);
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;

      AddCoin.amount[eid] = 5;

      coinSystem(world);

      expect(Coin.current[eid]).toBe(5);
      expect(hasComponent(world, AddCoin, eid)).toBe(false);
    });

    it("does not allow [Coin] amount to exceed max", () => {
      addComponents(world, [Coin, AddCoin], eid);
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;

      AddCoin.amount[eid] = 15;

      coinSystem(world);

      expect(Coin.current[eid]).toBe(10);
    });

    it("handles [SpendCoin] requests", () => {
      addComponents(world, [Coin, SpendCoin], eid);
      Coin.current[eid] = 5;
      Coin.max[eid] = 10;

      SpendCoin.amount[eid] = 5;

      coinSystem(world);

      expect(Coin.current[eid]).toBe(0);
      expect(hasComponent(world, SpendCoin, eid)).toBe(false);
    });

    it("does not allow [Coin] to be less than 0", () => {
      addComponents(world, [Coin, SpendCoin], eid);
      Coin.current[eid] = 5;

      SpendCoin.amount[eid] = 10;

      coinSystem(world);

      expect(Coin.current[eid]).toBe(0);
    });

    it("handles [SpendCoin] and [AddCoin] requests simultaneously", () => {
      addComponents(world, [Coin, AddCoin, SpendCoin], eid);
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;

      AddCoin.amount[eid] = 8;
      SpendCoin.amount[eid] = 4;

      coinSystem(world);

      expect(Coin.current[eid]).toBe(4);
      expect(hasComponent(world, AddCoin, eid)).toBe(false);
      expect(hasComponent(world, SpendCoin, eid)).toBe(false);
    });
  });
});
