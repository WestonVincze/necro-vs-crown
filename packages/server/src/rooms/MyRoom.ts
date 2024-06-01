import { Room, Client } from "@colyseus/core";
import { Crown, MyRoomState, Necro, Unit } from "./schema/MyRoomState";
import { CrownUnits, NecroUnits, followTarget } from "@necro-crown/shared"
import { getClosestUnit } from "@necro-crown/shared";

// TODO: create shared constant for client/server map/screen sizes
const mapWidth = 1024;
const mapHeight = 768;

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;
  fixedTimeStep = 1000 / 60;

  fixedUpdate(deltaTime: number) {
    const velocity = 2;

    this.state.enemies.forEach(enemy => {
      const options = {
        followForce: 1,
        separationForce: 2,
        maxSpeed: 1.5,
      }

      followTarget(
        enemy,
        getClosestUnit(enemy, this.state.minions.toArray()),
        this.state.allUnits,
        1.2,
        deltaTime,
        options
      )
    })

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
          /*
          const force = calculateFollowForce(
            minion,
            { x: input.mouseX, y: input.mouseY }
          )
          minion.x += force.x;
          minion.y += force.y;
          */
          const options = {
            followForce: 1,
            separationForce: 2,
            maxSpeed: 1.5,
          }

          followTarget(
            minion,
            { x: input.mouseX, y: input.mouseY },
            this.state.allUnits,
            1.2,
            deltaTime,
            options
          )
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

    let enemyCount = 0;
    this.onMessage("add_crown_unit", (client, { name, xPos, yPos }) => {
      // TODO: validate this action and verify the ID is legitimate
      const unitData = CrownUnits[name];
      if (!unitData) {
        console.log(`error, ${name} not found.`)
        return;
      }
      const enemy = new Unit();
      enemy.name = name;
      enemy.x = xPos;
      enemy.y = yPos;
      enemy.width = unitData.width;
      enemy.height = unitData.height;

      this.state.enemies.push(enemy);
      enemyCount++;
    })

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    let player;
    // create player instance
    if (options.playerType === "necro") {
      player = new Necro();
      // place player at random position
      player.x = (Math.random() * mapWidth);
      player.y = (Math.random() * mapHeight);


      // place minion at random position
      const minion = new Unit();
      const unitData = NecroUnits.skeleton;

      minion.name = unitData.name;
      minion.width = unitData.width;
      minion.height = unitData.height;

      minion.x = (Math.random() * mapWidth);
      minion.y = (Math.random() * mapHeight);
      this.state.minions.push(minion);
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
