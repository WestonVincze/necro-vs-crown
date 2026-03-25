import { Room, Client, CloseCode } from "colyseus";
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
import { Grid } from "pathfinding";
import { staticGridData } from "../staticGridData";
import {
  Faction,
  Pipeline,
  UnitName,
  type World,
  Coin,
  CoinAccumulator,
  Level,
  Player,
  createUnitEntity,
  Networked,
  networkSyncComponents,
  pipeline,
  createSeparationForceSystem,
  createMovementSystem,
  createFollowTargetSystemNew,
  createGridSystemNew,
  createAssignFollowTargetSystem,
  createTargetingSystem,
  createCooldownSystem,
  createCombatSystem,
  createProjectileCollisionSystem,
  createSpellcastingSystem,
  createHealthSystem,
  createDestroyAfterDelaySystem,
  createTimeSystem,
  createDeathSystem,
  GameEvents,
  HitSplatEvent,
  Input,
  BASE_EXP,
  createSpellEffectSystem,
  createBonesEntity,
  Cursor,
  getGridCellFromPosition,
  Position,
  GridCell,
  Behavior,
  Behaviors,
} from "@necro-crown/shared";
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

  private systems!: Pipeline;
  private tickSystems!: Pipeline;

  maxClients = 2;
  fixedTimeStep = 1000 / 60;
  tickTimeStep = 200;

  onCreate(options: any) {
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.grid = new Grid(staticGridData);
    this.world.gameEvents = new GameEvents();
    this.world.networkType = "networked";

    this.soaSerialize = createSoASerializer(networkSyncComponents);
    this.snapshotSerializer = createSnapshotSerializer(
      this.world,
      networkSyncComponents,
    );

    this.systems = pipeline([
      createGridSystemNew(this.world),
      createFollowTargetSystemNew(this.world),
      createSeparationForceSystem(),
      createMovementSystem(),
      createCooldownSystem(),
      createCombatSystem(),
      createProjectileCollisionSystem(),
      createCooldownSystem(),
      createSpellcastingSystem(),
      createSpellEffectSystem(this.world),
      createHealthSystem(),
      createDestroyAfterDelaySystem(),
      createTimeSystem(), // time should always be last
      createDeathSystem(this.world, Faction.Necro),
    ]);

    this.tickSystems = pipeline([
      createTargetingSystem(),
      createAssignFollowTargetSystem(),
    ]);

    this.world.gameEvents.hitSplat$.subscribe((e: HitSplatEvent) => {
      this.broadcast("hitsplat", e);
    });

    let elapsedTime = 0;
    let timeSinceLastTick = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;
      timeSinceLastTick += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedUpdate(this.fixedTimeStep);
      }
      while (timeSinceLastTick >= this.tickTimeStep) {
        timeSinceLastTick -= this.tickTimeStep;
        this.tickSystems(this.world);
      }
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
    this.onMessage(
      "set_cursor_waypoint",
      (client, { x, y }: { x: number; y: number }) => {
        // TODO: validate this action
        const [cursorEid] = query(this.world, [Cursor]);
        Position.x[cursorEid] = x;
        Position.y[cursorEid] = y;
        const gridCellPosition = getGridCellFromPosition({ x, y });
        GridCell.x[cursorEid] = gridCellPosition.x;
        GridCell.y[cursorEid] = gridCellPosition.y;
      },
    );

    this.onMessage("key_inputs", (client, keys) => {
      const player = this.players.get(client.sessionId);
      Input.castingSpell[player.eid] = keys.castingSpell ? 1 : 0;
      Input.moveX[player.eid] = keys.moveX;
      Input.moveY[player.eid] = keys.moveY;
    });

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
      createBonesEntity(this.world, 400, 400);

      const cursorEid = addEntity(this.world);
      addComponent(this.world, cursorEid, Cursor);
      addComponent(this.world, cursorEid, Position);
      addComponent(this.world, cursorEid, GridCell);
      addComponent(this.world, cursorEid, Networked);

      // create some skele mans
      for (let i = 0; i < 7; i++) {
        const skele = createUnitEntity(
          this.world,
          UnitName.Skeleton,
          Math.random() * 1024,
          Math.random() * 1024,
        );
        Behavior.type[skele] = Behaviors.FollowCursor;
      }
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
      createObserverSerializer(this.world, Networked, networkSyncComponents),
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
    // run system pipeline
    this.systems(this.world);

    // get updates to component values
    const soaUpdates = this.soaSerialize(
      query(this.world, [Networked]) as readonly number[],
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
