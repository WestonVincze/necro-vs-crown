import {
  defineEnterQueue,
  defineQuery,
  hasComponent,
  query,
  removeEntity,
} from "bitecs";
import { createBonesEntity, createUnitEntity } from "../../entities";
import {
  Crown,
  Dead,
  ExpReward,
  ItemDrops,
  Necro,
  Player,
  Position,
} from "../../components";
import { giveExpToEntity } from "../LevelUpSystem";

const giveExpToEnemyPlayers = (
  world: World,
  eid: number,
  experience: number,
) => {
  let enemyPlayers: readonly number[] = [];

  if (hasComponent(world, Crown, eid)) {
    enemyPlayers = query(world, [Necro, Player]);
  } else if (hasComponent(world, Necro, eid)) {
    enemyPlayers = query(world, [Crown, Player]);
  }

  if (!enemyPlayers) {
    console.warn(
      `Experience could not be awarded. No enemy players found for ${eid}.`,
    );
  }

  for (const player of enemyPlayers) {
    giveExpToEntity(world, player, experience);
  }
};

export const createDeathSystem = () => {
  const deadEntitiesQuery = defineQuery([Dead]);

  // death "effects" occur before the entity is deleted
  const expRewardQueue = defineEnterQueue([Dead, ExpReward]);
  const itemDropQueue = defineEnterQueue([Dead, Position, ItemDrops, Crown]);
  const deadPlayerQueue = defineEnterQueue([Dead, Player]);

  return (world: World) => {
    const expRewards = expRewardQueue(world);
    for (let i = 0; i < expRewards.length; i++) {
      const eid = expRewards[i];
      giveExpToEnemyPlayers(world, eid, ExpReward.amount[eid]);
    }

    const itemDrops = itemDropQueue(world);
    for (let i = 0; i < itemDrops.length; i++) {
      const eid = itemDrops[i];

      const x = Position.x[eid];
      const y = Position.y[eid];
      // TODO: implement item drops
      createBonesEntity(world, x, y);
    }

    const deadPlayers = deadPlayerQueue(world);
    for (let i = 0; i < deadPlayers.length; i++) {
      const eid = deadPlayers[i];
      // emit game over event
    }

    const deadEntities = deadEntitiesQuery(world);
    for (let i = 0; i < deadEntities.length; i++) {
      const eid = deadEntities[i];
      removeEntity(world, eid);
    }

    return world;
  };
};
