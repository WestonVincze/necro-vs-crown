import { query, hasComponent, removeEntity, observe, onAdd } from "bitecs";
import { createBonesEntity } from "$entities";
import {
  Crown,
  Dead,
  ExpReward,
  ItemDrops,
  Necro,
  Player,
  Position,
} from "$components";
import { giveExpToEntity } from "../LevelUpSystem";
import { gameEvents } from "$events";

const giveExpToEnemyPlayers = (
  world: World,
  eid: number,
  experience: number,
) => {
  const enemyComponents = hasComponent(world, eid, Crown)
    ? [Necro, Player]
    : [Crown, Player];

  const enemyPlayers = query(world, enemyComponents);

  if (enemyPlayers.length === 0) {
    console.warn(
      `Experience could not be awarded. No enemy players found for ${eid}.`,
    );
  }

  for (const player of enemyPlayers) {
    giveExpToEntity(world, player, experience);
  }
};

export const createDeathSystem = (world: World) => {
  const deadEntitiesQuery = (world: World) => query(world, [Dead]);

  // death "effects" occur before the entity is deleted
  const expRewardQueue: number[] = [];
  const itemDropQueue: number[] = [];
  const deadPlayerQueue: number[] = [];

  observe(world, onAdd(Dead, ExpReward), (eid) => expRewardQueue.push(eid));
  observe(world, onAdd(Dead, Position, ItemDrops, Crown), (eid) =>
    itemDropQueue.push(eid),
  );
  observe(world, onAdd(Dead, Player), (eid) => deadPlayerQueue.push(eid));

  return (world: World) => {
    const expRewardsEntered = expRewardQueue.splice(0);
    for (const eid of expRewardsEntered) {
      giveExpToEnemyPlayers(world, eid, ExpReward.amount[eid]);
    }

    const itemDropsEntered = itemDropQueue.splice(0);
    for (const eid of itemDropsEntered) {
      const x = Position.x[eid];
      const y = Position.y[eid];
      // TODO: implement item drops
      createBonesEntity(world, x, y);
    }

    const deadPlayersEntered = deadPlayerQueue.splice(0);
    for (const eid of deadPlayersEntered) {
      // emit game over event
      gameEvents.emitGameOver();
    }

    const deadEntities = deadEntitiesQuery(world);
    for (let i = 0; i < deadEntities.length; i++) {
      const eid = deadEntities[i];
      removeEntity(world, eid);
    }

    return world;
  };
};
