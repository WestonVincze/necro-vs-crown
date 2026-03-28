import { World } from "@necro-crown/shared";
import { Room } from "colyseus";

export class UpgradeManager {
  private selections = new Map<string, number>(); // sessionId -> optionIndex
  private timeout: NodeJS.Timeout | null = null;

  async startUpgradeRound(
    world: World,
    room: Room,
    pauseGame: () => void,
    resumeGame: () => void,
  ) {
    pauseGame();

    // const options = generateOptions(); // per-player option sets
    this.selections.clear();

    const options = {
      necro: [
        { id: 1, label: "one", description: "n1" },
        { id: 2, label: "two", description: "n2" },
        { id: 3, label: "three", description: "n3" },
      ],
      crown: [
        { id: 1, label: "one", description: "c1" },
        { id: 2, label: "two", description: "c2" },
        { id: 3, label: "three", description: "c3" },
      ],
    };

    room.broadcast("upgrade:start", {
      necroOptions: options.necro,
      crownOptions: options.crown,
      duration: 30000,
    });

    // Wait for both selections or timeout
    await this.waitForSelections(3000);

    // this.applyResults(world, options);
    resumeGame();
    room.broadcast("upgrade:complete");
  }

  private waitForSelections(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      this.timeout = setTimeout(resolve, timeout);

      const check = () => {
        if (this.selections.size >= 2) {
          clearTimeout(this.timeout!);
          resolve();
        }
      };

      // this.onSelection = check;
    });
  }

  recordSelection(sessionId: string, optionIndex: number) {
    this.selections.set(sessionId, optionIndex);
    // this.onSelection?.();
  }
}
