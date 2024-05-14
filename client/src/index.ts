import { AUTO, Scene, Types, Game, GameObjects, Input } from "phaser";
import { Client, Room } from "colyseus.js";

export class GameScene extends Scene {
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
  // pointer?: Input.Pointer;

  preload() {
    this.load.image('necro', 'necro.png');
    this.load.image('skele', 'skele.png');
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    // this.pointer = this.input.mousePointer;
  }

  client = new Client("ws://localhost:2567");
  room?: Room;

  playerEntities: {[sessionId: string]: any} = {};
  playerType: "necro" | "town" = "necro";

  minions: any[] = [];

  async create() {
    console.log('joining room...');

    try {
      this.room = await this.client.joinOrCreate("my_room");
      console.log("Joined Successfully!")
    } catch (e) {
      console.error(e);
    }

    this.room?.state.minions.onAdd((minion: any, sessionId: string) => {
      const entity = this.physics.add.image(minion.x, minion.y, 'skele');
      entity.width = 40;
      entity.height = 60;
      entity.displayWidth = 40;
      entity.displayHeight = 60;

      this.minions.push(entity);
      minion.onChange(() => {
        entity.setData('serverX', minion.x);
        entity.setData('serverY', minion.y);
      })
    });

    // TODO: is it possible to import the player Scheme so we can be type safe?
    this.room?.state.players.onAdd((player: any, sessionId: string) => {
      const entity = this.physics.add.image(player.x, player.y, 'necro');
      entity.width = 50;
      entity.height = 114;
      entity.displayWidth = 50;
      entity.displayHeight = 114;

      entity.type = player.type;

      this.playerEntities[sessionId] = entity

      /*
      if (Object.keys(this.playerEntities).length > 0) this.playerType = "town";
      if (this.playerType === "necro") {
        // spawn skeletons
        const minion = this.physics.add.image(200, 300, 'skele');
        minion.displayWidth = 40;
        minion.displayHeight = 60;
      }
      */

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
    if (!this.room || !this.currentPlayer) return;

    // TODO: send cursor position data here

    for (let minion in this.minions) {
      const entity = this.minions[minion];

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

    let mouseInputs = {}
    if (this.currentPlayer.type === "necro") {
      mouseInputs = {
        mouseX: this.input.mousePointer.x,
        mouseY: this.input.mousePointer.y,
      }
    }

    // send input to server
    this.inputPayload = {
      left: this.cursorKeys?.left.isDown || false,
      right: this.cursorKeys?.right.isDown || false,
      up: this.cursorKeys?.up.isDown || false,
      down: this.cursorKeys?.down.isDown || false,
      ...mouseInputs
    }
    this.room.send(0, this.inputPayload);


    const velocity = 2;

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
    if (!this.room || !this.currentPlayer) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedUpdate(time, this.fixedTimeStep);
    }
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
  scene: [ GameScene ],
}

// instantiate game
const game = new Game(config);
