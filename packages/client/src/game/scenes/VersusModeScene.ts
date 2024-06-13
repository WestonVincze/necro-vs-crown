import { Scene, type Types, GameObjects } from "phaser";
import { Client, Room } from "colyseus.js";
import { addNewCards, crownState$, playCard } from "$game/Crown";
import { createMouseManager } from "../../input/MouseInputs";
import { createKeyboardManager } from "../../input/KeyboardInputs";
import { defineAction } from "../../input/Actions";
import { Faction } from "@necro-crown/shared";

// TODO: refactor Crown and Necro logic into separate classes or modules
export class VersusModeScene extends Scene {
  constructor() {
    super("VersusModeScene");
  }

  currentPlayer?: Types.Physics.Arcade.ImageWithDynamicBody;
  remoteRef?: GameObjects.Rectangle;

  // local input cache
  inputPayload: { left: boolean, right: boolean, up: boolean, down: boolean, mouseX?: number, mouseY?: number } = { 
    left: false,
    right: false,
    up: false,
    down: false,
  }

  cursorKeys?: Types.Input.Keyboard.CursorKeys;
  keyboardManager =  createKeyboardManager()
  mouseManager = createMouseManager(document.getElementById("game-container") || document.documentElement)

  preload() {
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    // this.pointer = this.input.mousePointer;
  }

  init (data: { player: Faction }) {
    this.playerType = data.player;
    // load the corresponding UI
  }

  client = new Client("ws://localhost:2567");
  room?: Room;

  playerEntities: {[sessionId: string]: any} = {};
  playerType!: Faction;

  units: any[] = [];

  async create() {
    console.log('joining room...');

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

    this.room?.state.minions.onAdd((minion: any, sessionId: string) => {
      const entity = this.physics.add.image(minion.x, minion.y, 'skele');
      entity.width = 40;
      entity.height = 60;
      entity.displayWidth = 40;
      entity.displayHeight = 60;

      this.units.push(entity);
      minion.onChange(() => {
        entity.setData('serverX', minion.x);
        entity.setData('serverY', minion.y);
      })
    });

    this.room?.state.enemies.onAdd((enemy: any, sessionId: string) => {
      const entity = this.physics.add.image(enemy.x, enemy.y, enemy.name);
      entity.width = enemy.width;
      entity.height = enemy.height;
      entity.displayWidth = enemy.width;
      entity.displayHeight = enemy.height;

      this.units.push(entity);
      enemy.onChange(() => {
        entity.setData('serverX', enemy.x);
        entity.setData('serverY', enemy.y);
      })
    });

    // TODO: is it possible to import the player Scheme so we can be type safe?
    this.room?.state.players.onAdd((player: any, sessionId: string) => {
      if (player.type === "crown") { 
        // show card UI
        return;
      } else {
        defineAction({
          name: "cursor_pos", 
          callback: (event) => {
            const rect = document.getElementById("game-container")?.getBoundingClientRect();
            if (!rect) return;

            const mouseEvent = event as MouseEvent;
            const { left, top } = rect;

            this.inputPayload.mouseX = mouseEvent.x - left;
            this.inputPayload.mouseY = mouseEvent.y - top;
          }, 
          binding: {
            mouseEvents: ["mousemove"]
          }
        })
        const entity = this.physics.add.image(player.x, player.y, 'necro');
        entity.width = 50;
        entity.height = 114;
        entity.displayWidth = 50;
        entity.displayHeight = 114;

        this.playerEntities[sessionId] = entity

        if (sessionId === this.room?.sessionId) {
          // sessionId matches, this is the current player
          this.currentPlayer = entity;

          // remoteRef is for debugging purposes
          this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
          this.remoteRef.setStrokeStyle(1, 0xAA5555)

          player.onChange(() => {
            if (!this.remoteRef) return;
            this.remoteRef.x = player.x;
            this.remoteRef.y = player.y;
          })

        } else {
          player.onChange(() => {
            // LERP during render loop instead of updating immediately
            entity.setData('serverX', player.x);
            entity.setData('serverY', player.y);
            /*
            entity.x = player.x;
            entity.y = player.y;
            */
            /* How to listen to individual properties: */
            // player.listen("x", (newX, prevX) => console.log(newX, prevX));
          })
        }
      }
    })

    this.room?.state.players.onRemove((player: any, sessionId: string) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();

        delete this.playerEntities[sessionId];
      }
    })
  }

  fixedUpdate(time: number, delta: number) {
    if (!this.room) return;

    // TODO: send cursor position data here
    for (let unit in this.units) {
      const entity = this.units[unit];

      const { serverX, serverY } = entity.data.values;

      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.1);
      entity.y = Phaser.Math.Linear(entity.y, serverY, 0.1);
    }

    for (let sessionId in this.playerEntities) {
      // skip interpolation for current player
      if (sessionId === this.room.sessionId) continue;

      const entity = this.playerEntities[sessionId];
      const { serverX, serverY } = entity.data.values;

      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.1);
      entity.y = Phaser.Math.Linear(entity.y, serverY, 0.1);
    }

    if (this.playerType === Faction.Necro) {

      // send input to server
      this.inputPayload = {
        ...this.inputPayload,
        left: this.keyboardManager.isKeyPressed("a"),
        right: this.keyboardManager.isKeyPressed("d"),
        up: this.keyboardManager.isKeyPressed("w"),
        down: this.keyboardManager.isKeyPressed("s"),
      }
      this.room.send(0, this.inputPayload);
    }

    const velocity = 2;

    if (!this.currentPlayer) return;

    if (this.inputPayload.left) {
      this.currentPlayer.x -= velocity;
    } else if (this.inputPayload.right) {
      this.currentPlayer.x += velocity;
    }

    if (this.inputPayload.up) {
      this.currentPlayer.y -= velocity;
    } else if (this.inputPayload.down) {
      this.currentPlayer.y += velocity;
    }
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