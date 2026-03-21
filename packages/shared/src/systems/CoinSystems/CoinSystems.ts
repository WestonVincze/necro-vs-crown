import { addComponent, query, hasComponent, removeComponent } from "bitecs";
import { AddCoin, CoinAccumulator, Coin, SpendCoin } from "../../components";
import { type World } from "../../types";

export const createCoinAccumulationSystem = () => {
  const coinAccumulatorQuery = (world: World) =>
    query(world, [Coin, CoinAccumulator]);

  return (world: World) => {
    for (const eid of coinAccumulatorQuery(world)) {
      CoinAccumulator.timeUntilNextPay[eid] -= world.time.delta;
      if (CoinAccumulator.timeUntilNextPay[eid] <= 0) {
        giveCoins(world, eid, CoinAccumulator.amount[eid]);

        CoinAccumulator.timeUntilNextPay[eid] = CoinAccumulator.frequency[eid];
      }
    }

    return world;
  };
};

export const createCoinSystem = () => {
  const addCoinQuery = (world: World) => query(world, [Coin, AddCoin]);
  const spendCoinQuery = (world: World) => query(world, [Coin, SpendCoin]);
  return (world: World) => {
    for (const eid of addCoinQuery(world)) {
      Coin.current[eid] = Math.min(
        Coin.current[eid] + AddCoin.amount[eid],
        Coin.max[eid],
      );

      removeComponent(world, eid, AddCoin);
    }

    for (const eid of spendCoinQuery(world)) {
      Coin.current[eid] = Math.max(
        Coin.current[eid] - SpendCoin.amount[eid],
        0,
      );

      removeComponent(world, eid, SpendCoin);
    }
    return world;
  };
};

// TODO: see if this can be generic
export const giveCoins = (world: World, eid: number, amount: number) => {
  if (hasComponent(world, eid, AddCoin)) {
    AddCoin.amount[eid] += amount;
  } else {
    addComponent(world, eid, AddCoin);
    AddCoin.amount[eid] = amount;
  }
};

export const spendCoins = (world: World, eid: number, amount: number) => {
  if (hasComponent(world, eid, AddCoin)) {
    SpendCoin.amount[eid] += amount;
  } else {
    addComponent(world, eid, AddCoin);
    SpendCoin.amount[eid] = amount;
  }
};
