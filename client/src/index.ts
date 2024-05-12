import { AUTO, Scene, Types, Game } from "phaser";
import { Client, Room, SchemaSerializer } from "colyseus.js";

export class GameScene extends Scene {
  // local input cache
  inputPayload = { 
    left: false,
    right: false,
    up: false,
    down: false,
  }

  cursorKeys?: Types.Input.Keyboard.CursorKeys;

  preload() {
    this.load.image('necro', 'necro.png');
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
  }

  client = new Client("ws://localhost:2567");
  room?: Room;

  playerEntities: {[sessionId: string]: any} = {};

  async create() {
    console.log('joining room...');

    try {
      this.room = await this.client.joinOrCreate("my_room");
      console.log("Joined Successfully!")
    } catch (e) {
      console.error(e);
    }

    // TODO: is it possible to import the player Scheme so we can be type safe?
    this.room?.state.players.onAdd((player: any, sessionId: string) => {
      const entity = this.physics.add.image(player.x, player.y, 'necro');
      entity.displayWidth = 50;
      entity.displayHeight = 114;

      this.playerEntities[sessionId] = entity

      player.onChange(() => {
        entity.x = player.x;
        entity.y = player.y;
      })

      /* How to listen to individual properties: */
      // player.listen("x", (newX, prevX) => console.log(newX, prevX));
    })

    this.room?.state.players.onRemove((player: any, sessionId: string) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();

        delete this.playerEntities[sessionId];
      }
    })
  }

  update(time: number, delta: number): void {
    if (!this.room) return;

    // TODO: send cursor position data here

    // send input to server
    this.inputPayload = {
      left: this.cursorKeys?.left.isDown || false,
      right: this.cursorKeys?.right.isDown || false,
      up: this.cursorKeys?.up.isDown || false,
      down: this.cursorKeys?.down.isDown || false,
    }

    this.room.send(0, this.inputPayload);
  }
}

// game config
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#eee',
  parent: 'necro',
  physics: { default: "arcade" },
  scene: [ GameScene ]
}

// instantiate game
const game = new Game(config);
