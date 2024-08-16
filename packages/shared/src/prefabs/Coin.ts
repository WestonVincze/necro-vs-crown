import { definePrefab } from "bitecs";
import { CoinAccumulator, Coin, Crown, Player } from "$components";

export const CrownPlayer = definePrefab([Crown, Player, Coin, CoinAccumulator]);
