import { defineComponent, Types } from "bitecs";
import { Upgrade } from "../types";

export const UpgradeRequest = [] as {
  upgrades: Upgrade[];
}[];

export const SelectedUpgrade = defineComponent({ upgradeId: Types.ui8 });
