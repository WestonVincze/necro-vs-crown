import { Scene, type Types, GameObjects } from "phaser";
import { Client, Room } from "colyseus.js";
import { Faction, createUnitEntity, type Pipeline } from "@necro-crown/shared";
import { createWorld } from "bitecs";

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
    // load the corresponding UI
  }

  client = new Client("ws://localhost:2567");
  room?: Room;

  units: any[] = [];

  async create() {
    console.log("joining room...");
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };

    /*
    try {
      this.room = await this.client.joinOrCreate("my_room", { playerType: this.playerType });
      console.log("Joined Successfully!")
      if (this.playerType === Faction.Crown) { 
        defineAction({
          name: 'mouseAction',
          callback: (event) => {
            const { selectedCard } = crownState$.value;
            if (selectedCard === null) return;

            const rect = document.getElementById("game-container")?.getBoundingClientRect();
            if (!rect) return;

            const { left, top } = rect;
            const mouseEvent = event as MouseEvent | DragEvent

            const xPos = mouseEvent.x - left;
            const yPos = mouseEvent.y - top;

            playCard(() => {
              this.room?.send("add_crown_unit", {
                name: selectedCard.UnitID,
                xPos,
                yPos
              });
            });
          },
          binding: { mouseEvents: ["mouseup", "dragend"] }
        })
      }
    } catch (e) {
      console.error(e);
    }
      */

    this.room?.state.minions.onAdd((minion: any, sessionId: string) => {
      createUnitEntity(this.world, "Skeleton", minion.x, minion.y);

      const entity = this.physics.add.image(minion.x, minion.y, "skele");
      entity.width = 40;
      entity.height = 60;
      entity.displayWidth = 40;
      entity.displayHeight = 60;

      // this.units.push(entity);
      /*
      minion.onChange(() => {
        entity.setData('serverX', minion.x);
        entity.setData('serverY', minion.y);
      })
      */
    });

    this.room?.state.enemies.onAdd((enemy: any, sessionId: string) => {
      const entity = this.physics.add.image(enemy.x, enemy.y, enemy.name);
      entity.width = enemy.width;
      entity.height = enemy.height;
      entity.displayWidth = enemy.width;
      entity.displayHeight = enemy.height;

      this.units.push(entity);
      enemy.onChange(() => {
        entity.setData("serverX", enemy.x);
        entity.setData("serverY", enemy.y);
      });
    });

    this.room?.state.players.onAdd((player: any, sessionId: string) => {
      // this.playerEntities[sessionId] = entity

      if (sessionId === this.room?.sessionId) {
        // sessionId matches, this is the current player
        // this.currentPlayer = entity;
      }
    });

    this.room?.state.players.onRemove((player: any, sessionId: string) => {
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
