import {
  CardData,
  Card,
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
const BASE_EXP = 25;

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
  private selections = new Map<string, string>();
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

    this.selections.clear();

    const necroOptions = generateStatUpgradeOptions(this.necroUnitWeights, 3);

    let crownOptions: Upgrade[] = [];
    if (this.upgradeCount % 3 === 0) {
      crownOptions = generateStatUpgradeOptions(this.crownUnitWeights, 2);
      crownOptions.push(
        generateAddCardUpgradeOption("addCard", this.upgradeCount),
      );
    } else {
      crownOptions = generateStatUpgradeOptions(this.crownUnitWeights, 3);
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

  recordSelection(sessionId: string, id: string) {
    if (!this.activeUpgradeRound) return;
    if (this.selections.has(sessionId)) return;

    this.selections.set(sessionId, id);
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
            name: upgrade.unitName,
            cost: upgrade.cost,
          };
          // quick hack to add new cards to pool and increase upgrade chance over time
          if (validStatsByUnitType[card.name]) {
            if (!this.crownUnitWeights[card.name]) {
              this.crownUnitWeights[card.name] = 1;
            } else {
              this.crownUnitWeights[card.name] += 1;
            }
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
    return Math.floor(BASE_EXP * Math.pow(1.1, this.upgradeCount));
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
  id: string,
  upgradeCount: number,
): Upgrade {
  const unitName = rollUnitType({
    [UnitName.Militia]: upgradeCount,
    [UnitName.Guard]: Math.floor(upgradeCount / 3),
    [UnitName.Doppelsoldner]: Math.floor(upgradeCount / 6),
    [UnitName.Archer]: Math.floor(upgradeCount / 6),
    [UnitName.Paladin]: Math.floor(upgradeCount / 10),
  });

  return {
    id,
    type: "addCard",
    unitName,
    cost: CardData[unitName].cost,
  };
}

function generateStatUpgradeOptions(
  unitWeights: UnitWeights,
  count: number = 1,
): Upgrade[] {
  const upgrades: Upgrade[] = [];

  while (upgrades.length < count) {
    const unitName = rollUnitType(unitWeights);
    const [id, statUpdates] = generateStatUpgrade(unitName, Math.random());
    if (!upgrades.find((u) => u.id === id)) {
      upgrades.push({
        id,
        type: "stat",
        unitName,
        statUpdates,
      });
    }
  }

  return upgrades;
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
): [string, StatUpdate[]] {
  const definitions = validStatsByUnitType[unitType];
  if (!definitions?.length)
    throw new Error(`No upgrade config for ${unitType}`);

  const definition =
    definitions[Math.floor(Math.random() * definitions.length)];

  return [
    definition.id,
    definition.stats.map(({ name, range }) => ({
      name,
      value: applyRarity(range, rarity),
    })),
  ];
}
