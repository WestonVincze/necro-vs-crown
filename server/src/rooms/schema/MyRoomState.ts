import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  inputQueue: any[] = [];
}

export class Unit extends Schema {
  @type("string") unitID: string;
  @type("number") x: number;
  @type("number") y: number;
}

export class Necro extends Player {
  @type("string") type: "necro";
  @type("number") x: number;
  @type("number") y: number;
}

export class Crown extends Player {
  @type("string") type: "crown";
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Necro | Crown>();
  @type({ map: Unit }) minions = new MapSchema<Unit>();
  @type({ map: Unit }) enemies = new MapSchema<Unit>();
}
