import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") type: "necro" | "town";
  @type("number") x: number;
  @type("number") y: number;
  inputQueue: any[] = [];
}

export class Minion extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Minion }) minions = new MapSchema<Minion>();
}
