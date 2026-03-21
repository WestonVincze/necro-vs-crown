import {
  query,
  hasComponent,
  removeEntity,
  observe,
  onAdd,
  isNested,
} from "bitecs";
import { createBonesEntity, createUnitEntity } from "../../entities";
import {
  Crown,
  Dead,
  ExpReward,
  Necro,
  Player,
  Position,
} from "../../components";
import { giveExpToEntity } from "../LevelUpSystem";
import { legacyGameEvents } from "../../events";
import { Faction, UnitName } from "../../types";

const giveExpToEnemyPlayers = (
  world: World,
  eid: number,
  experience: number,
) => {
  const enemyComponents = hasComponent(world, eid, Crown)
    ? [Necro, Player]
    : [Crown, Player];

  // TODO: nested query might be overkill here
  const enemyPlayers = query(world, enemyComponents, isNested);

  if (enemyPlayers.length === 0) {
    console.warn(
      `Experience could not be awarded. No enemy players found for ${eid}.`,
    );
  }

  for (const player of enemyPlayers) {
    giveExpToEntity(world, player, experience);
  }
};

export const createDeathSystem = (world: World, faction: Faction) => {
  // death "effects" occur before the entity is deleted
  const deadPlayerQueue: number[] = [];

  observe(world, onAdd(Dead, Player), (eid) => deadPlayerQueue.push(eid));

  return (world: World) => {
    const deadPlayersEntered = deadPlayerQueue.splice(0);
    for (const eid of deadPlayersEntered) {
      // emit game over event
      legacyGameEvents.emitGameOver();
    }

    for (const eid of query(world, [Dead])) {
      // TODO: implement item drops
      if (hasComponent(world, eid, Crown)) {
        const x = Position.x[eid];
        const y = Position.y[eid];
        // spawn bones or skeleton depending on mode
        if (faction === Faction.Necro) {
          createBonesEntity(world, x, y);
        } else {
          createUnitEntity(world, UnitName.Skeleton, x, y);
        }
      }

      // reward exp if applicable
      if (hasComponent(world, eid, ExpReward)) {
        giveExpToEnemyPlayers(world, eid, ExpReward.amount[eid]);
      }

      removeEntity(world, eid);
    }

    return world;
  };
};
