import { query, hasComponent, removeEntity, observe, onAdd } from "bitecs";
import {
  createBonesEntity,
  Crown,
  Dead,
  ExpReward,
  Faction,
  Necro,
  Player,
  Position,
  type World,
} from "@necro-crown/shared";

export const createDeathSystem = (world: World) => {
  // death "effects" occur before the entity is deleted
  const deadPlayerQueue: number[] = [];

  observe(world, onAdd(Dead, Player), (eid) => deadPlayerQueue.push(eid));

  return (world: World) => {
    const deadPlayersEntered = deadPlayerQueue.splice(0);
    for (const eid of deadPlayersEntered) {
      // emit game over event
      const winner = hasComponent(world, eid, Necro)
        ? Faction.Crown
        : Faction.Necro;
      world.gameEvents.gameOver$.next({
        winner,
        time: world.time.elapsed,
      });
    }

    for (const eid of query(world, [Dead])) {
      // TODO: implement item drops
      if (hasComponent(world, eid, Crown)) {
        const x = Position.x[eid];
        const y = Position.y[eid];
        createBonesEntity(world, x, y);
      }

      // reward exp if applicable
      if (hasComponent(world, eid, ExpReward)) {
        world.experience += ExpReward.amount[eid];
        // giveExpToEnemyPlayers(world, eid, ExpReward.amount[eid]);
      }

      removeEntity(world, eid);
    }

    return world;
  };
};
