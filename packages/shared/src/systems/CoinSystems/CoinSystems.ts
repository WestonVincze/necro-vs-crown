import {
  addComponent,
  defineQuery,
  hasComponent,
  removeComponent,
} from "bitecs";
import { AddCoin, CoinAccumulator, Coin, SpendCoin } from "$components";

export const createCoinAccumulationSystem = () => {
  const coinAccumulatorQuery = defineQuery([Coin, CoinAccumulator]);

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
  const addCoinQuery = defineQuery([Coin, AddCoin]);
  const spendCoinQuery = defineQuery([Coin, SpendCoin]);
  return (world: World) => {
    for (const eid of addCoinQuery(world)) {
      Coin.current[eid] = Math.min(
        Coin.current[eid] + AddCoin.amount[eid],
        Coin.max[eid],
      );

      removeComponent(world, AddCoin, eid);
    }

    for (const eid of spendCoinQuery(world)) {
      Coin.current[eid] = Math.max(
        Coin.current[eid] - SpendCoin.amount[eid],
        0,
      );

      removeComponent(world, SpendCoin, eid);
    }
    return world;
  };
};

// TODO: see if this can be generic
export const giveCoins = (world: World, eid: number, amount: number) => {
  if (hasComponent(world, AddCoin, eid)) {
    AddCoin.amount[eid] += amount;
  } else {
    addComponent(world, AddCoin, eid);
    AddCoin.amount[eid] = amount;
  }
};

export const spendCoins = (world: World, eid: number, amount: number) => {
  if (hasComponent(world, AddCoin, eid)) {
    SpendCoin.amount[eid] += amount;
  } else {
    addComponent(world, AddCoin, eid);
    SpendCoin.amount[eid] = amount;
  }
};
