import { hasComponent, query, removeComponent } from "bitecs";
import { Dead, Health, Player, type World } from "@necro-crown/shared";

export const createGodModeSystem = (
  world: World,
  getGodMode: () => boolean,
) => {
  return (world: World) => {
    if (!getGodMode()) return world;

    for (const eid of query(world, [Dead, Player])) {
      removeComponent(world, eid, Dead);
      Health.current[eid] = Math.max(1, Health.current[eid]);
    }

    return world;
  };
};
