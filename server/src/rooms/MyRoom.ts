import { Room, Client } from "@colyseus/core";
import { Crown, Minion, MyRoomState, Necro, Player } from "./schema/MyRoomState";

export const calculateFollowForce = (target: { x: number, y: number }, self: { x: number, y: number }) => {
  const followForce = { x: 0, y: 0 };
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const directionX = dx / distance;
    const directionY = dy / distance;

    followForce.x = directionX;
    followForce.y = directionY;
  }

  return followForce;
}

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;
  fixedTimeStep = 1000 / 60;

  fixedUpdate(deltaTime: number) {
    const velocity = 2;

    this.state.players.forEach(player => {
      let input: any;

      if (player.type === "crown") return;
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

        this.state.minions.forEach(minion => {
          const force = calculateFollowForce({ x: input.mouseX, y: input.mouseY }, { x: minion.x, y: minion.y })
          minion.x += force.x;
          minion.y += force.y;
        })
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
    const mapWidth = 1024;
    const mapHeight = 768;

    let player;
    // create player instance
    if (options.playerType === "necro") {
      player = new Necro();
      // place player at random position
      player.x = (Math.random() * mapWidth);
      player.y = (Math.random() * mapHeight);


      // place minion at random position
      const minion = new Minion();
      minion.x = (Math.random() * mapWidth);
      minion.y = (Math.random() * mapHeight);
      this.state.minions.set(client.sessionId, minion);
    } else if (options.playerType === "crown") {
      player = new Crown();
    }
    player.type = options.playerType;
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
