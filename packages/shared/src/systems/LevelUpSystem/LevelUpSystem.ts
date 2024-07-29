import { gameEvents } from "../../events";
import { Faction, Upgrade } from "../../types";
import { Experience, Level, StatName } from "../../components";
import { addComponent, defineQuery, removeComponent } from "bitecs";
import { getRandomElements } from "../../helpers";

export const BASE_EXP = 35;
export const MAX_LEVEL = 50;

/**
 * query for entities with "Level" and "Experience" components
 * add "experience" to levelProgress
 * if next level is achieved, increment level, set new threshold
 * remove experience component
 *
 */
export const createLevelUpSystem = () => {
  const query = defineQuery([Level, Experience]);

  return (world: World) => {
    for (const eid of query(world)) {
      const newExperience = Level.currentExp[eid] + Experience.amount[eid];

      if (
        Level.expToNextLevel[eid] > 0 &&
        newExperience >= Level.expToNextLevel[eid]
      ) {
        Level.currentLevel[eid] += 1;

        // set currentExp to the remaining exp
        Level.currentExp[eid] = newExperience - Level.expToNextLevel[eid];

        Level.expToNextLevel[eid] = getExpForNextLevel(Level.currentLevel[eid]);

        // TODO: upgrade option selected by AI if not main player
        gameEvents.emitLevelUp({
          eid,
          newLevel: Level.currentLevel[eid],
          faction: Faction.Necro,
          upgrades: getRandomElements(upgradeOptions, 3),
        });

        // perform "onLevelUp" callback
        /**
         * upgrade request is sent - this should be processed at the end of the frame
         * UI is shown
         * once a selection is made, system needs to process the decision
         * game resumes
         */
      } else {
        Level.currentExp[eid] = newExperience;
      }

      removeComponent(world, Experience, eid);
    }

    return world;
  };
};

/**
 * @param world bitECS world
 * @param eid entity ID
 * @param experience experience to add
 */
export const giveExpToEntity = (
  world: World,
  eid: number,
  experience: number,
) => {
  try {
    addComponent(world, Experience, eid);
    Experience.amount[eid] = experience;
  } catch (e) {
    console.warn(e);
  }
};

/**
 * @param currentLevel the current level of the entity
 * @returns the total experience required to reach the next level, or 0 if already at max level
 */
export const getExpForNextLevel = (currentLevel: number) => {
  if (currentLevel >= MAX_LEVEL) return 0;
  return BASE_EXP + currentLevel * 10;
};

const upgradeOptions: Upgrade[] = [
  {
    stat: StatName.MaxHealth,
    value: 5,
    title: "Max HP",
    description: "Increases max HP of ALL {unit} by 5",
  },
  {
    stat: StatName.Armor,
    value: 1,
    title: "Armor",
    description: "Increases Armor of ALL {unit} by 1",
  },
  {
    stat: StatName.HealthRegeneration,
    value: 0.1,
    title: "HP Regen",
    description: "Increases HP Regen of ALL {unit} by 0.1",
  },
];
