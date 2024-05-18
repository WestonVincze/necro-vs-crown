import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  inputQueue: any[] = [];
}

export class Necro extends Player {
  @type("string") type: "necro";
  @type("number") x: number;
  @type("number") y: number;
}

export class Crown extends Player {
  @type("string") type: "crown";
}

export class Minion extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Necro | Crown>();
  @type({ map: Minion }) minions = new MapSchema<Minion>();
}
