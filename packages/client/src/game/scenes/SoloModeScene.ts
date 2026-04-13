import { addComponent, addEntity, createWorld } from "bitecs";
import { GameObjects, Scene } from "phaser";
import { Grid } from "pathfinding";
import {
  type System,
  Player,
  createUnitEntity,
  createBonesEntity,
  Faction,
  Behavior,
  Behaviors,
  createTargetSpawnerEntity,
  UnitName,
  Level,
  CoinAccumulator,
  Coin,
  createDeathSystem,
  GameEvents,
  type Pipeline,
  BASE_EXP,
  type World,
  profiler,
  Position,
  GridCell,
  Cursor,
  getGridCellFromPosition,
  CrownStateStore,
  generateMockCards,
  createEmitUpgradeRequestEventSystem,
  createUpgradeSelectionSystem,
  createHandleUpgradeSelectEventSystem,
  createLevelUpSystem,
  createUnitSpawnerSystem,
  createSeparationForceSystem,
  createMovementSystem,
  createCooldownSystem,
  createCombatSystem,
  createProjectileCollisionSystem,
  createSpellcastingSystem,
  createSpellEffectSystem,
  createStatUpdateSystem,
  createHealthSystem,
  createDestroyAfterDelaySystem,
  pipeline,
  updateWorldTime,
} from "@necro-crown/shared";
import {
  createInputHandlerSystem,
  createHitSplatSystem,
  createGridSystem,
  createFollowTargetSystem,
  createDrawCollisionSystem,
  createSpriteSystem,
  createDrawSpellEffectSystem,
  createHealthBarSystem,
} from "$game/systems";
import { GameState } from "$game/managers";
import { buildTickPipeline } from "$game/pipelines";
import { crownClientState } from "$game/Crown";
import { buildTileMap } from "../../helpers/TileMap";
import { initializeCrownControls } from "../../input/CrownControls";
import { initializeNecroMouseControls } from "../../input/NecroMouseControls";

export class SoloModeScene extends Scene {
  private playerType!: Faction;

  private world!: World;

  private initializeEntities: () => void = () => {};

  // system references
  private tickSystems!: Pipeline;
  private physicsSystems!: Pipeline;

  private spriteMap = new Map<number, GameObjects.Sprite | GameObjects.Rope>();
  private timeSinceLastTick: number = 0;

  constructor() {
    super("SoloModeScene");
  }

  init(data: { player: Faction }) {
    // ensure input is enabled in config
    this.playerType = data.player;
  }

  create() {
    // instantiate world
    this.world = createWorld();
    this.world.time = { delta: 0, elapsed: 0, then: performance.now() };
    this.world.gameEvents = new GameEvents();
    this.world.networkType = "offline";
    this.world.unitUpgrades = {};
    // this.world.experience = 0; // not yet used

    // create base systems
    let physicsSystems: { pre: System[]; post: System[] } = {
      pre: [],
      post: [],
    };

    /* 
    const { gui } = GameState;

    const main = gui.addFolder("Main Camera");
    main.add(this.camera, "scrollX").listen();
    main.add(this.camera, "scrollY").listen();

    const entityData = gui.addFolder("Entity Data");
    const entityMethods = {
      printEntities: () => console.log(getAllEntities(this.world)),
      printComponents: () =>
        getAllEntities(this.world).forEach((eid) =>
          console.log(getEntityComponents(this.world, eid)),
        ),
    };
    entityData.add(entityMethods, "printEntities").name("Print Entities");
    entityData
      .add(entityMethods, "printComponents")
      .name("Print Entity Components");
    */

    /** Add global debug functions */
    /*
    (window as any).getEntities = () => getAllEntities(this.world);
    (window as any).getEntityComponents = (eid: number) => getEntityComponents(this.world, eid);
    */

    const { gridData, map } = buildTileMap(this);

    this.world.grid = new Grid(gridData);

    // Faction specific configurations
    switch (this.playerType) {
      case Faction.Crown:
        this.initializeEntities = () => {
          // create player
          const crown = addEntity(this.world);
          addComponent(this.world, crown, Player);
          addComponent(this.world, crown, Level);
          Level.currentLevel[crown] = 0;
          Level.currentExp[crown] = 0;
          Level.expToNextLevel[crown] = BASE_EXP;
          addComponent(this.world, crown, Coin);
          addComponent(this.world, crown, CoinAccumulator);
          Coin.current[crown] = 0;
          Coin.max[crown] = 10;
          CoinAccumulator.amount[crown] = 1;
          CoinAccumulator.frequency[crown] = 1000;

          // create starting units
          for (let i = 0; i < 5; i++) {
            const eid = createUnitEntity(
              this.world,
              UnitName.Skeleton,
              Math.random() * 750,
              Math.random() * 750,
            );
            addComponent(this.world, eid, Behavior);
            Behavior.type[eid] = Behaviors.AutoTarget;
          }
        };
        // system overrides
        physicsSystems.pre = [
          createGridSystem(this.world, map),
          createFollowTargetSystem(this.world, this),
        ];

        physicsSystems.post = [createDeathSystem(this.world, Faction.Crown)];

        const crownState = new CrownStateStore();
        crownState.start();
        const { hand$, discard$, coins$ } = crownState;
        hand$.subscribe((hand) => crownClientState.applyHandUpdate(hand));
        discard$.subscribe((discard) =>
          crownClientState.applyDiscardUpdate(discard),
        );
        coins$.subscribe((coins) => crownClientState.applyCoinsUpdate(coins));
        crownState.addCards(generateMockCards(8));
        crownState.drawCard();
        crownState.drawCard();
        crownState.drawCard();
        crownState.drawCard();
        initializeCrownControls(this, (id, x, y) => {
          crownState.playCard(id, (name) =>
            createUnitEntity(this.world, name, x, y),
          );
        });
        break;

      case Faction.Necro:
        this.initializeEntities = () => {
          // create Necro player
          const necro = createUnitEntity(
            this.world,
            UnitName.Necromancer,
            0,
            1600,
          );

          createTargetSpawnerEntity(this.world, necro);
          for (let i = 0; i < 5; i++) {
            createBonesEntity(
              this.world,
              Math.random() * 400 - 200,
              Math.random() * 200 + 1600,
            );
          }
        };

        // system overrides
        physicsSystems.pre = [
          createInputHandlerSystem(),
          createGridSystem(this.world, map),
          createFollowTargetSystem(this.world, this),
        ];

        physicsSystems.post = [createDeathSystem(this.world, Faction.Necro)];

        const cursorEid = addEntity(this.world);
        addComponent(this.world, cursorEid, Cursor);
        addComponent(this.world, cursorEid, Position);
        addComponent(this.world, cursorEid, GridCell);

        initializeNecroMouseControls(this, (x, y) => {
          Position.x[cursorEid] = x;
          Position.y[cursorEid] = y;
          const gridCellPosition = getGridCellFromPosition({ x, y });
          GridCell.x[cursorEid] = gridCellPosition.x;
          GridCell.y[cursorEid] = gridCellPosition.y;
        });
        break;
    }

    this.physicsSystems = pipeline([
      ...physicsSystems.pre,
      createEmitUpgradeRequestEventSystem(this.world),
      createUpgradeSelectionSystem(),
      createHandleUpgradeSelectEventSystem(), // subscribes to game events...
      createLevelUpSystem(),
      createUnitSpawnerSystem(),
      createDrawCollisionSystem(this.world, this),
      createSeparationForceSystem(),
      createMovementSystem(),
      createCooldownSystem(),
      createCombatSystem(),
      createProjectileCollisionSystem(),
      createSpellcastingSystem(),
      createSpellEffectSystem(this.world),
      createDrawSpellEffectSystem(this.world, this),
      createStatUpdateSystem(),
      createHealthSystem(),
      createDestroyAfterDelaySystem(),
      createSpriteSystem(this.world, this, this.spriteMap, this.playerType),
      createHealthBarSystem(this.world, this),
      ...physicsSystems.post,
    ]);

    this.tickSystems = buildTickPipeline();

    // reactive systems
    createHitSplatSystem(this.world, this);

    /** INITIALIZE ENTITIES */
    this.initializeEntities();

    this.events.once("shutdown", GameState.destroyGameState);
  }

  /** RUN PHYSICS SYSTEMS */
  update(time: number, delta: number): void {
    updateWorldTime(this.world);
    if (GameState.isPaused()) return;
    profiler.start("FRAME_TIMER");
    this.timeSinceLastTick += delta;

    if (this.timeSinceLastTick > 200) {
      this.tickSystems(this.world);
      this.timeSinceLastTick = 0;
      if (GameState.isDebugMode()) profiler.logResults();
    }
    this.physicsSystems(this.world);
    profiler.end("FRAME_TIMER");
  }
}
