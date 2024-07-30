/**
 * all possible upgrades
 *
 * Update stats
 * * make a statUpdateRequest for ALL units
 */
import { UnitName } from "../../types";
import { updateStatsForUnitsOfType } from "..";
import { StatName } from "../../components";
import { gameEvents } from "$events";

export const createProcessUpgradeEventSystem = () => {
  return (world: World) => {
    gameEvents.onUpgradeSelect.subscribe(({ eid, stat, value }) => {
      // update all existing units
      updateStatsForUnitsOfType(world, UnitName.Skeleton, [
        { stat: StatName.MoveSpeed, value: 1 },
        {
          stat: StatName.MaxMoveSpeed,
          value: 1,
        },
      ]);

      // TODO: update base stats for future skeletons
    });
    return world;
  };
};
