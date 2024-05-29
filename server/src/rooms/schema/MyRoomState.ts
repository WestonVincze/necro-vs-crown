import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  inputQueue: any[] = [];
}

export class Unit extends Schema {
  @type("string") id: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number;
  @type("number") height: number;
  @type("number") vx: number;
  @type("number") vy: number;
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
  @type([Unit]) minions = new ArraySchema<Unit>();
  @type([Unit]) enemies = new ArraySchema<Unit>();

  get allUnits() {
    return [...this.enemies, ...this.minions];
  }
}
