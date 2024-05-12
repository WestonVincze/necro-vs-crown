import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  fixedTimeStep = 1000 / 60;

  fixedUpdate(deltaTime: number) {
    const velocity = 2;

    this.state.players.forEach(player => {
      let input: any;

      while (input = player.inputQueue.shift()) {
        if (input.left) {
          player.x -= velocity;

        } else if (input.right) {
          player.x += velocity;
        }

        if (input.up) {
          player.y -= velocity;

        } else if (input.down) {
          player.y += velocity;
        }
      }
    })
  }

  onCreate (options: any) {
    this.setState(new MyRoomState());

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;
      
      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedUpdate(this.fixedTimeStep);
      }
      this.fixedUpdate(deltaTime);
    })

    // handle player input
    this.onMessage(0, (client, input) => {
      // get reference to player that sent message
      const player = this.state.players.get(client.sessionId);
      player.inputQueue.push(input);

    })

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // TODO: create shared constant for client/server map/screen sizes
    const mapWidth = 800;
    const mapHeight = 600;

    // create player instance
    const player = new Player();

    // place player at random position
    player.x = (Math.random() * mapWidth);
    player.y = (Math.random() * mapHeight);

    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
