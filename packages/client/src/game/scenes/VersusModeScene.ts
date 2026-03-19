import { Scene } from "phaser";
import { Client, Room, Callbacks } from "@colyseus/sdk";
import {
  Faction,
  UnitName,
  createUnitEntity,
  type Pipeline,
} from "@necro-crown/shared";
import { createWorld } from "bitecs";
import { type World } from "@necro-crown/shared";
import { defineAction } from "../../input/Actions";
import { crownState$, playCard } from "$game/Crown";
import { createMouseManager } from "../../input/MouseInputs";
import { MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";

// TODO: refactor Crown and Necro logic into separate classes or modules
export class VersusModeScene extends Scene {
  constructor() {
    super("VersusModeScene");
  }

  playerEntities: { [sessionId: string]: any } = {};
  private playerType!: Faction;
  private world!: World;

  // system references
  private reactiveSystems!: Pipeline;
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  init(data: { player: Faction }) {
    this.playerType = data.player;
    // until mouse inputs are improved, we need to instantiate mouse manager
    createMouseManager(
      document.getElementById("game-container") || document.documentElement,
    );
  }

  // recommended type safety (but where is server defined?)
  // client = new Client<typeof server>("ws://localhost:2567");
  client = new Client("ws://localhost:2567");
  room?: Room;

  units: any[] = [];

  async create() {
    console.log("joining room...");
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };

    createMouseManager(
      document.getElementById("game-container") || document.documentElement,
    );

    try {
      // we can use joinOrCreate<MyState> or joinOrCreate<MyRoom>
      this.room = await this.client.joinOrCreate(
        "my_room",
        {
          playerType: this.playerType === Faction.Crown ? "crown" : "necro",
        },
        MyRoomState,
      );
      console.log("Joined Successfully!");

      if (this.playerType === Faction.Crown) {
        defineAction({
          name: "mouseAction",
          callback: (event) => {
            const { selectedCard } = crownState$.value;
            if (selectedCard === null) return;

            const rect = document
              .getElementById("game-container")
              ?.getBoundingClientRect();
            if (!rect) return;

            const { left, top } = rect;
            const mouseEvent = event as MouseEvent | DragEvent;

            const xPos = mouseEvent.x - left;
            const yPos = mouseEvent.y - top;

            playCard(() => {
              this.room?.send("add_crown_unit", {
                name: selectedCard.name,
                xPos,
                yPos,
              });
            });
          },
          binding: { mouseEvents: ["mouseup", "dragend"] },
        });
      }
    } catch (e) {
      console.error(e);
    }

    if (!this.room) return;

    const callbacks = Callbacks.get(this.room);

    callbacks.onAdd("minions", (minion: any, sessionId) => {
      console.log("MINION ADDED")
      createUnitEntity(this.world, UnitName.Skeleton, minion.x, minion.y);

      const entity = this.physics.add.image(minion.x, minion.y, minion.name);
      entity.width = 40;
      entity.height = 60;
      entity.displayWidth = 40;
      entity.displayHeight = 60;

      this.units.push(entity);
      callbacks.onChange(minion, () => {
        entity.setData("serverX", minion.x);
        entity.setData("serverY", minion.y);
      });
    })

    callbacks.onAdd("enemies", (enemy: any, sessionId) => {
      const entity = this.physics.add.image(enemy.x, enemy.y, enemy.name);
      entity.width = enemy.width;
      entity.height = enemy.height;
      entity.displayWidth = enemy.width;
      entity.displayHeight = enemy.height;

      this.units.push(entity);
      callbacks.onChange(enemy, () => {
        entity.setData("serverX", enemy.x);
        entity.setData("serverY", enemy.y);
      });
    });

    callbacks.onAdd("players", (player: any, sessionId) => {
      // this.playerEntities[sessionId] = entity
      console.log("A player has joined! Their id is " + sessionId)

      if (sessionId === this.room?.sessionId) {
        // sessionId matches, this is the current player
        // this.currentPlayer = entity;
      }
    });

    callbacks.onRemove("players", (player: any, sessionId: any) => {
      // clean up player resources
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();

        delete this.playerEntities[sessionId];
      }
    });
  }

  fixedUpdate(time: number, delta: number) {
    if (!this.room) return;
  }

  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;

  update(time: number, delta: number): void {
    if (!this.room) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedUpdate(time, this.fixedTimeStep);
    }
  }
}
