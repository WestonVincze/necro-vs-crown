import {
  Card,
  StatName,
  StatUpdate,
  UnitMeta,
  UnitName,
  updateStatByEid,
  updateUnitBaseStats,
  World,
} from "@necro-crown/shared";
import { query } from "bitecs";
import { Room } from "colyseus";

type BaseUpgrade = {
  id: number;
  label?: string;
  description?: string;
};

type Upgrade = BaseUpgrade &
  (
    | { type: "stat"; unitName: UnitName; statUpdates: StatUpdate[] }
    | { type: "addCard"; unitName: UnitName }
  );

export class UpgradeManager {
  private selections = new Map<string, number>(); // sessionId -> optionIndex
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
    // TODO: pausing the game seems to cause state sync issues (dead unit sprites not being destroyed)
    pauseGame();

    // const options = generateOptions(); // per-player option sets
    this.selections.clear();

    const necroOptions: Upgrade[] = [
      {
        id: 1,
        type: "stat",
        unitName: UnitName.Skeleton,
        statUpdates: [{ stat: StatName.MaxHealth, value: 5 }],
      },
      {
        id: 2,
        type: "stat",
        unitName: UnitName.Skeleton,
        statUpdates: [{ stat: StatName.MaxHit, value: 1 }],
      },
      {
        id: 4,
        type: "stat",
        unitName: UnitName.Skeleton,
        statUpdates: [
          { stat: StatName.MoveSpeed, value: 1 },
          { stat: StatName.MaxMoveSpeed, value: 1 },
        ],
      },
    ];

    const crownOptions: Upgrade[] = [
      {
        id: 5,
        type: "addCard",
        unitName: UnitName.Guard,
      },
      {
        id: 6,
        type: "stat",
        unitName: UnitName.Peasant,
        statUpdates: [
          { stat: StatName.MoveSpeed, value: 1 },
          { stat: StatName.MaxMoveSpeed, value: 1 },
        ],
      },
      {
        id: 7,
        type: "stat",
        unitName: UnitName.Peasant,
        statUpdates: [{ stat: StatName.MaxHealth, value: 3 }],
      },
    ];

    room.broadcast("upgrade:start", {
      necroOptions,
      crownOptions,
      duration: 30000,
    });

    // Wait for both selections or timeout
    await this.waitForSelections(30000);

    // TODO: auto-select upgrade if timer runs out for a player
    this.applyResults(world, [...necroOptions, ...crownOptions], addCard);
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
            cost: 4,
          };
          addCard(card);
          break;
      }
    }
    this.selections.clear();
    this.activeUpgradeRound = false;
    // get the upgrade type to understand what function to run
    // modify the state
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
        updateStatByEid(world, eid, update.stat, update.value);
      }
    }
  }
};
