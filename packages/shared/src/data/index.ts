import { CrownUnits } from "./CrownUnits";
import { NecroUnits } from "./NecroUnits";

export * from "./CrownUnits";
export * from "./NecroUnits";

export const AllUnits = { ...CrownUnits, ...NecroUnits }
