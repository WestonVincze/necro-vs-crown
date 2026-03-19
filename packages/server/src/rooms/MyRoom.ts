import { Room, Client, CloseCode } from "colyseus";
import { Faction, UnitName, World } from "@necro-crown/shared/src/types";
import {
  addComponent,
  addEntity,
  createWorld,
  query,
  removeEntity,
} from "bitecs";
import {
  createObserverSerializer,
  createSnapshotSerializer,
  createSoASerializer,
} from "bitecs/serialization";
import { BASE_EXP } from "@necro-crown/shared/src/constants";
import {
  Coin,
  CoinAccumulator,
} from "@necro-crown/shared/src/components/Coins";
import { Level } from "@necro-crown/shared/src/components/Level";
import { Player } from "@necro-crown/shared/src/components/Tags";
import { createUnitEntity } from "@necro-crown/shared/src/entities/Unit";
import { Position } from "@necro-crown/shared/src/components/Position";
import {
  Networked,
  networkSynComponents,
} from "@necro-crown/shared/src/components/Networking";

interface PlayerRecord {
  eid: number;
  sessionId: string;
}

export class MyRoom extends Room {
  private world!: World;
  private soaSerialize: (
    selectedEntities: readonly number[] | number[],
  ) => ArrayBuffer;
  private observerSerializers: Map<string, () => ArrayBuffer> = new Map();
  private snapshotSerializer: (
    selectedEntities?: readonly number[] | number[],
  ) => ArrayBuffer;
  players: Map<string, PlayerRecord> = new Map();

  maxClients = 2;
  fixedTimeStep = 1000 / 60;

  onCreate(options: any) {
    this.world = createWorld();
    this.soaSerialize = createSoASerializer(networkSynComponents);
    this.snapshotSerializer = createSnapshotSerializer(
      this.world,
      networkSynComponents,
    );

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedUpdate(this.fixedTimeStep);
      }
      this.fixedUpdate(deltaTime);
    });

    this.onMessage(
      "add_crown_unit",
      (
        client,
        { name, xPos, yPos }: { name: UnitName; xPos: number; yPos: number },
      ) => {
        // TODO: validate this action and verify the ID is legitimate
        const eid = createUnitEntity(this.world, name, xPos, yPos);
        addComponent(this.world, eid, Networked);
      },
    );

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  onJoin(client: Client, options: { playerType: Faction }) {
    console.log(client.sessionId, "joined!");
    let eid: number;

    // create player instance
    if (options.playerType === Faction.Necro) {
      eid = createUnitEntity(this.world, UnitName.Necromancer, 500, 500);
    } else if (options.playerType === Faction.Crown) {
      eid = addEntity(this.world);
      addComponent(this.world, eid, Player);
      addComponent(this.world, eid, Level);
      Level.currentLevel[eid] = 0;
      Level.currentExp[eid] = 0;
      Level.expToNextLevel[eid] = BASE_EXP;
      addComponent(this.world, eid, Coin);
      addComponent(this.world, eid, CoinAccumulator);
      Coin.current[eid] = 0;
      Coin.max[eid] = 10;
      CoinAccumulator.amount[eid] = 1;
      CoinAccumulator.frequency[eid] = 1000;
    }

    addComponent(this.world, eid, Networked);

    this.players.set(client.sessionId, { eid, sessionId: client.sessionId });
    // create new observer serializer for this client
    this.observerSerializers.set(
      client.sessionId,
      createObserverSerializer(this.world, Networked, networkSynComponents),
    );

    // initial state sync
    const snapshot = this.snapshotSerializer();
    client.send("snapshot", snapshot);
  }

  onLeave(client: Client, code: CloseCode) {
    console.log(client.sessionId, "left!");

    const player = this.players.get(client.sessionId);
    if (player) {
      removeEntity(this.world, player.eid);
      this.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  fixedUpdate(deltaTime: number) {
    // run systems
    // ...
    for (const eid of query(this.world, [Position, Networked])) {
      Position.x[eid] += 0.1;
      Position.y[eid] += 0.1;
    }

    // get updates to component values
    const soaUpdates = this.soaSerialize(
      query(this.world, networkSynComponents) as readonly number[],
    );
    this.broadcast("soaUpdates", soaUpdates);

    // get updates for add/remove entities & components for the client
    for (const [sessionId, serializer] of this.observerSerializers) {
      const updates = serializer();
      if (updates.byteLength > 0) {
        const client = this.clients.getById(sessionId);
        if (client) {
          client.send("observerUpdates", updates);
        }
      }
    }
  }
}
