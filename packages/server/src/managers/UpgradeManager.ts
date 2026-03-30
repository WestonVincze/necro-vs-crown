import {
  Card,
  StatName,
  StatUpdate,
  StatUpgradeRange,
  UnitMeta,
  UnitName,
  updateStatByEid,
  updateUnitBaseStats,
  Upgrade,
  validStatsByUnitType,
  World,
} from "@necro-crown/shared";
import { query } from "bitecs";
import { Room } from "colyseus";
const BASE_EXP = 10;

type UnitWeights = Partial<Record<UnitName, number>>;

export function rollUnitType(weights: UnitWeights): UnitName {
  const entries = Object.entries(weights) as [UnitName, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let roll = Math.random() * total;

  for (const [unitName, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return unitName;
  }

  // Fallback to last entry in case of floating point imprecision
  return entries[entries.length - 1][0];
}

export class UpgradeManager {
  private upgradeCount = 0;
  private necroUnitWeights: UnitWeights = {
    [UnitName.Necromancer]: 1,
    [UnitName.Skeleton]: 3,
  };
  private crownUnitWeights: UnitWeights = {
    [UnitName.Peasant]: 10,
  };
  private selections = new Map<string, number>();
  private timeout: NodeJS.Timeout | null = null;
  private onSelection: () => void;
  private activeUpgradeRound = false;
  private playerCount = 2;

  async startUpgradeRound(
    world: World,
    room: Room,
    pauseGame: () => void,
    resumeGame: () => void,
    addCard: (card: Card) => void,
  ) {
    this.activeUpgradeRound = true;
    this.upgradeCount += 1;
    // TODO: pausing the game seems to cause state sync issues (dead unit sprites not being destroyed)
    pauseGame();

    // const options = generateOptions(); // per-player option sets
    this.selections.clear();

    // id = 1-3
    const necroOptions: Upgrade[] = [];
    for (let i = 1; i <= 3; i++) {
      necroOptions.push(generateStatUpgradeOption(i, this.necroUnitWeights));
    }

    // id = 4-6
    const crownOptions: Upgrade[] = [];
    for (let i = 4; i <= 6; i++) {
      // first option of every third upgrade is a new card
      if (this.upgradeCount % 3 === 0 && i === 4) {
        crownOptions.push(generateAddCardUpgradeOption(i, this.upgradeCount));
      } else {
        crownOptions.push(generateStatUpgradeOption(i, this.crownUnitWeights));
      }
    }

    room.broadcast("upgrade:start", {
      necroOptions,
      crownOptions,
      duration: 30000,
    });

    // Wait for both selections or timeout
    await this.waitForSelections(30000);

    // TODO: auto-select upgrade if timer runs out for a player
    this.applyResults(world, [...necroOptions, ...crownOptions], addCard);
    console.log("resuming");
    resumeGame();
    room.broadcast("upgrade:complete");
  }

  private waitForSelections(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      this.timeout = setTimeout(resolve, timeout);

      const check = () => {
        if (this.selections.size >= this.playerCount) {
          clearTimeout(this.timeout!);
          resolve();
        }
      };

      this.onSelection = check;
    });
  }

  recordSelection(sessionId: string, optionIndex: number) {
    if (!this.activeUpgradeRound) return;
    if (this.selections.has(sessionId)) return;

    this.selections.set(sessionId, optionIndex);
    this.onSelection?.();
  }

  applyResults(
    world: World,
    options: Upgrade[],
    addCard: (card: Card) => void,
  ) {
    // handle stat upgrade
    // go through each selection
    for (const [_, optionIndex] of this.selections) {
      const upgrade = options.find((v) => v.id === optionIndex);
      if (!upgrade) {
        console.error(
          `Invalid upgrade selection. ${optionIndex} is not a valid id.`,
        );
        continue;
      }
      console.log(`Fulfilling upgrade ${upgrade.id} on ${upgrade.unitName}`);
      switch (upgrade.type) {
        case "stat":
          updateUnitBaseStats(world, upgrade.unitName, upgrade.statUpdates);
          updateWorldUnitStats(world, upgrade.unitName, upgrade.statUpdates);
          break;
        case "addCard":
          const card = {
            id: 15,
            name: upgrade.unitName,
            cost: upgrade.cost,
          };
          // quick hack to add new cards to pool and increase upgrade chance over time
          if (!this.crownUnitWeights[card.name]) {
            this.crownUnitWeights[card.name] = 1;
          } else {
            this.crownUnitWeights[card.name] += 1;
          }
          addCard(card);
          break;
      }
    }
    this.selections.clear();
    this.activeUpgradeRound = false;
    // get the upgrade type to understand what function to run
    // modify the state
  }

  public getExpToNextUpgrade() {
    return Math.floor(BASE_EXP * Math.pow(1.5, this.upgradeCount));
  }
}

const updateWorldUnitStats = (
  world: World,
  unitName: UnitName,
  updates: StatUpdate[],
) => {
  for (const eid of query(world, [UnitMeta])) {
    if (UnitMeta.name[eid] === unitName) {
      for (const update of updates) {
        updateStatByEid(world, eid, update.name, update.value);
      }
    }
  }
};

// temporary function to add card upgrade
function generateAddCardUpgradeOption(
  count: number,
  upgradeCount: number,
): Upgrade {
  const roll = Math.random();
  let unitName: UnitName;
  let cost = 0;
  if (upgradeCount < 6 || roll < 0.3) {
    unitName = UnitName.Guard;
    cost = 4;
  } else if (upgradeCount < 10 || roll < 0.5) {
    unitName = UnitName.Paladin;
    cost = 5;
  } else if (roll < 0.75) {
    unitName = UnitName.Archer;
    cost = 6;
  } else {
    unitName = UnitName.Doppelsoldner;
    cost = 6;
  }

  return {
    id: count,
    type: "addCard",
    unitName,
    cost,
  };
}

function generateStatUpgradeOption(
  count: number,
  unitWeights: UnitWeights,
): Upgrade {
  const unitName = rollUnitType(unitWeights);

  return {
    id: count,
    type: "stat",
    unitName,
    statUpdates: generateStatUpgrade(unitName, Math.random()),
  };
}

/**
 * Interpolates between min and max using a 0-1 rarity value.
 * rarity 0 = min, rarity 1 = max
 */
function applyRarity(range: StatUpgradeRange, rarity: number): number {
  const clamped = Math.max(0, Math.min(1, rarity));
  return Number((range.min + (range.max - range.min) * clamped).toFixed(2));
}

export function generateStatUpgrade(
  unitType: UnitName,
  rarity: number,
): StatUpdate[] {
  const definitions = validStatsByUnitType[unitType];
  if (!definitions?.length)
    throw new Error(`No upgrade config for ${unitType}`);

  const definition =
    definitions[Math.floor(Math.random() * definitions.length)];

  return definition.stats.map(({ name, range }) => ({
    name,
    value: applyRarity(range, rarity),
  }));
}
