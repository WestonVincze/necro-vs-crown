import { AddToStat } from "$components";
import { defineQuery } from "bitecs";

export const createUpgradeSystem = () => {
  const query = defineQuery([AddToStat]);

  return (world: World) => {
    for (const eid of query(world)) {
      // check if entity has stat
      // modify stat or display warning
      // clear
    }

    return world;
  };
};
