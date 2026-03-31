<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { writable, derived } from "svelte/store";
  import { DEFAULT_CROWN_CONFIG, DEFAULT_STARTING_HAND, Faction, UnitName, Units, type CrownConfig, type GameSettings, type PlayerConfig, type Stats } from "@necro-crown/shared";
  import { Client, Room } from "@colyseus/sdk";
  import { pendingGameSession } from "../../stores/GameSessionStore";
  import { goto } from "$app/navigation";
  import { Icon } from "$icons";
  import { Modal } from "$UI/Modal"
  import { StatOverrides } from "$UI/StatOverrides";
  import { Logo } from "$UI/Logo";
  import { Navbar } from "$UI/Navbar";

  type LobbyState = {
    players: Record<string, PlayerConfig>;
  } & GameSettings;

  // --- Store ---
  const lobbyState = writable<LobbyState>({
    players: {},
    statOverrides: {},
    startingCards: { ...DEFAULT_STARTING_HAND },
    crownConfig: { ...DEFAULT_CROWN_CONFIG },
    skeleMansCount: 7, 
  });

  const error = writable<string | null>(null);
  const connected = writable(false);
  const sessionId = writable<string | null>(null);

  const myPlayer = derived([lobbyState, sessionId], ([$state, $sid]) =>
    $sid ? $state.players[$sid] ?? null : null
  );

  const otherPlayers = derived([lobbyState, sessionId], ([$state, $sid]) =>
    Object.entries($state.players)
      .filter(([id]) => id !== $sid)
      .map(([id, config]: [id: string, config: PlayerConfig]) => ({ id, ...config }))
  );

  const allReady = derived(lobbyState, ($state) => {
    const players = Object.values($state.players);
    return (
      players.length === 2 &&
      players.every((p) => p.ready && p.faction !== null)
    );
  });

  const takenFactions = derived(lobbyState, ($state) =>
    Object.values($state.players)
      .map((p) => p.faction)
      .filter(Boolean)
  );

  $: playerCount = Object.values(otherPlayers).length + 1;
  const crownUnits = [
    UnitName.Peasant,
    UnitName.Militia,
    UnitName.Guard,
    UnitName.Paladin,
    UnitName.Archer,
    UnitName.Doppelsoldner,
  ]
  $: startingCards = Object.keys($lobbyState.startingCards) as UnitName[];

  // --- Colyseus ---
  let room: Room | null = null;

  onMount(async () => {
    try {
      const client = new Client(import.meta.env.VITE_SERVER_URI);
      const roomId = new URLSearchParams(window.location.search)?.get("roomId");
      room = roomId
        ? await client.joinById(roomId)
        : await client.joinOrCreate("lobby");

      sessionId.set(room.sessionId);
      connected.set(true);

      room.onMessage("lobby:updated", (state: LobbyState) => {
        lobbyState.set(state);
      });

      room.onMessage("game:starting", async ({ reservation }) => {
        await room?.leave();
        const gameRoom = await client.consumeSeatReservation(reservation);

        gameRoom.onMessage("session:init", ({ faction }) => {
          pendingGameSession.set({ room: gameRoom, faction });
          goto("/versus");
        });
      });

      room.onMessage("error", ({ message }: { message: string }) => {
        error.set(message);
        setTimeout(() => error.set(null), 3000);
      });

      room.onLeave(() => connected.set(false));
    } catch (e) {
      error.set("Could not connect to lobby server.");
    }
  });

  onDestroy(() => room?.leave());

  // --- Actions ---
  function selectFaction(faction: Faction) {
    if (ready) return;
    room?.send("selectFaction", { faction });
  }

  let settingsOpen = false;
  let unitSettingsOpen = false;
  let deckSettingsOpen = false;
  let ready = false;
  function setReady() {
    if (!ready) {
      room?.send("ready");
      ready = true;
    } else {
      room?.send("unready");
      ready = false;
    }
  }

  function updateCrownConfig(key: keyof CrownConfig, value: number) {
    lobbyState.update((s) => {
      return ({
        ...s,
        crownConfig: { ...s.crownConfig, [key]: value },
      })
    });
    room?.send("updateCrownConfig", { [key]: value });
  }

  function updateUnitStatOverrides(unitName: UnitName, stats: Partial<Stats>) {
    room?.send("updateUnitStatOverrides", { unitName, stats });
  }

  function resetAllOverrides() {
    room?.send("resetAllOverrides")
  }
  
  function updateStartingCard(unitName: UnitName, value: number) {
    lobbyState.update((s) => {
      const current = s.startingCards[unitName] || 0;
      console.log(current, value)
      return ({
        ...s,
        startingCards: { ...s.startingCards, [unitName]: value + current}
      })
    });
    room?.send("updateStartingCard", { unitName, value });
  }

  function updateSkeleMansCount(value: number) {
    lobbyState.update((s) => {
      return ({
        ...s,
        skeleMansCount: value
      })
    });
    room?.send("updateSkeleMansCount", value);
  }

  // --- Helpers ---
  const FACTION_META = {
    [Faction.Necro]: {
      label: "Necro",
      description: "Summon skeletons from the bones of your enemies and survive the forces of the Crown for as long as possible.",
    },
    [Faction.Crown]: {
      label: "Crown",
      description: "Defeat the blasphemous necromancer by managing resources and deploying Crown units through a strategic hand of cards.",
    },
  } as const;
</script>

<div class="lobby">
  <Navbar>
    <div class="connection-status" class:online={$connected}>
      <span class="dot" />
      {$connected ? "Connected" : "Disconnected"}
      {$connected && room?.roomId ? `(${room.roomId})` : ""}
    </div>
  </Navbar>

  <Logo />

  {#if $error}
    <div class="error-banner" role="alert">{$error}</div>
  {/if}

  <main class="content">
    <!-- Faction Selection -->
    <section class="panel faction-panel">
      <h2 class="panel-label">Choose your faction</h2>
      <div class="factions">
        <button
          class="faction-card necro"
          class:selected={$myPlayer?.faction === Faction.Necro}
          class:taken={$takenFactions.includes(Faction.Necro) && $myPlayer?.faction !== Faction.Necro}
          class:locked={$takenFactions.includes(Faction.Necro)}
          on:click={() => selectFaction(Faction.Necro)}
          aria-pressed={$myPlayer?.faction === Faction.Necro}
        >
          <Icon height="30px" name="skull" />
          <span class="faction-name">
            {FACTION_META[Faction.Necro].label}
          </span>
          <span class="faction-desc">
            {FACTION_META[Faction.Necro].description}
          </span>
          {#if $takenFactions.includes(Faction.Necro) && $myPlayer?.faction !== Faction.Necro}
            <span class="faction-badge">Taken</span>
          {/if}
        </button>
        <button
          class="faction-card crown"
          class:selected={$myPlayer?.faction === Faction.Crown}
          class:taken={$takenFactions.includes(Faction.Crown) && $myPlayer?.faction !== Faction.Crown}
          class:locked={$takenFactions.includes(Faction.Crown)}
          on:click={() => selectFaction(Faction.Crown)}
          aria-pressed={$myPlayer?.faction === Faction.Crown}
        >
          <Icon height="30px" name="crown" />
          <span class="faction-name">
            {FACTION_META[Faction.Crown].label}
          </span>
          <span class="faction-desc">
            {FACTION_META[Faction.Crown].description}
          </span>
          {#if $takenFactions.includes(Faction.Crown) && $myPlayer?.faction !== Faction.Crown}
            <span class="faction-badge">Taken</span>
          {/if}
        </button>
      </div>
    </section>

    <!-- Players -->
    <section class="panel players-panel">
      <h2 class="panel-label">Players ({playerCount} / 2)</h2>
      <div class="player-list">
        <!-- Self -->
        <div class="player-row self" class:necro={$myPlayer?.faction === Faction.Necro} class:crown={$myPlayer?.faction === Faction.Crown}>
          <span class="player-tag">You</span>
          <span class="player-faction">
            {$myPlayer?.faction
              ? FACTION_META[$myPlayer.faction].label
              : "No faction"}
          </span>
          <span class="ready-pip" class:ready={$myPlayer?.ready} />
        </div>

        <!-- Others -->
        {#each $otherPlayers as player}
          <div class="player-row opponent">
            <span class="player-tag">Opponent</span>
            <span class="player-faction">
              {player.faction ? FACTION_META[player.faction].label : "Choosing..."}
            </span>
            <span class="ready-pip" class:ready={player.ready} />
          </div>
        {/each}

        {#if Object.keys($lobbyState.players).length < 2}
          <div class="player-row waiting">
            <span class="player-tag">—</span>
            <span class="player-faction">Waiting for opponent...</span>
          </div>
        {/if}
      </div>
    </section>

    <!-- Ready -->
    <div class="ready-row">
      <button class="btn" on:click={() => deckSettingsOpen = true}>Starting Deck</button>
      <button class="btn" on:click={() => settingsOpen = true}>Settings</button>
      <button class="btn" on:click={() => unitSettingsOpen = true}>Unit Editor</button>
      <button
        class="btn ready-btn"
        class:all-ready={$allReady}
        disabled={!$myPlayer?.faction}
        on:click={setReady}
      >
        {#if $myPlayer?.ready}
          Unready
        {:else if $allReady}
          Starting...
        {:else}
          Ready up
        {/if}
      </button>
    </div>

    <!-- Starting Hand -->
    <Modal bind:open={deckSettingsOpen} title="Modify Start Cards" width={"680px"}>
      <section>
        <div class="start-cards-buttons">
          {#each crownUnits as unit}
            <div class="start-cards-button">
              <div class="image-container">
                <img src={Units[unit].url} alt={unit} />
              </div>
              <div class="button-group">
                <button
                  class="btn"
                  disabled={!$lobbyState.startingCards[unit]}
                  on:click={() => updateStartingCard(
                      unit,
                      -1
                    )
                  }
                >
                  -
                </button>
                <button class="btn" on:click={() => updateStartingCard(unit, 1)}>
                  +
                </button>
              </div>
            </div>
          {/each}
        </div>

        <div class="start-deck">
          <h3>Starting Cards</h3>
          <div class="start-deck-cards">
          {#each startingCards as card}
            {#each Array($lobbyState.startingCards[card]) as i}
              <div class="card-image-container">
                <img src={Units[card].url} alt={card} />
              </div>
            {/each}
          {/each}
          </div>
        </div>
      </section>
    </Modal>

    <!-- Unit Stat Overrides -->
    <Modal bind:open={unitSettingsOpen} title="Unit Editor">
      <section>
        <StatOverrides
          bind:overrides={$lobbyState.statOverrides}
          onChange={updateUnitStatOverrides}
          onReset={resetAllOverrides}
        />
      </section>
    </Modal>

    <!-- Crown Config Settings -->
    <Modal bind:open={settingsOpen} title="Game Settings">
      <section class="panel config-panel">
        <h2 class="panel-label">Crown Settings</h2>
        <div class="config-rows">
          <label class="config-row">
            <span class="config-label">Max coins</span>
            <div class="config-control">
              <input
                type="range"
                min="5" max="20" step="1"
                value={$lobbyState.crownConfig.maxCoins}
                on:change={(e) => updateCrownConfig("maxCoins", +e.currentTarget.value)}
              />
              <span class="config-value">{$lobbyState.crownConfig.maxCoins}</span>
            </div>
          </label>

          <label class="config-row">
            <span class="config-label">Hand size</span>
            <div class="config-control">
              <input
                type="range"
                min="3" max="12" step="1"
                value={$lobbyState.crownConfig.maxHandSize}
                on:change={(e) => updateCrownConfig("maxHandSize", +e.currentTarget.value)}
              />
              <span class="config-value">{$lobbyState.crownConfig.maxHandSize}</span>
            </div>
          </label>

          <label class="config-row">
            <span class="config-label">Coin interval (ms)</span>
            <div class="config-control">
              <input
                type="range"
                min="500" max="3000" step="100"
                value={$lobbyState.crownConfig.coinInterval}
                on:change={(e) => updateCrownConfig("coinInterval", +e.currentTarget.value)}
              />
              <span class="config-value">{$lobbyState.crownConfig.coinInterval}</span>
            </div>
          </label>
        </div>
      </section>
      <section class="panel config-panel">
        <h2 class="panel-label">Necro Settings</h2>
        <div class="config-rows">
          <label class="config-row">
            <span class="config-label">Skele Mans Start Count</span>
            <div class="config-control">
              <input
                type="range"
                min="5" max="25" step="1"
                value={$lobbyState.skeleMansCount}
                on:change={(e) => updateSkeleMansCount(+e.currentTarget.value)}
              />
              <span class="config-value">{$lobbyState.skeleMansCount}</span>
            </div>
          </label>
        </div>
      </section>
    </Modal>

  </main>
</div>

<style>
  .lobby {
    pointer-events: all;
    min-height: 100vh;
    color: var(--font-color);
    font-weight: 300;
    position: relative;
    overflow: hidden;
    padding-top: var(--nav-padding);
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--font-color-soft);
  }

  .connection-status.online {
    color: #7a9e6e;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .connection-status.online .dot {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Error */
  .error-banner {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #3a1a1a;
    border-bottom: 1px solid #6b2d2d;
    color: #e07070;
    text-align: center;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    to { transform: translateY(0); opacity: 1; }
    from { transform: translateY(100%); opacity: 0; }
  }

  /* Content */
  .content {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 2.5rem 2rem;
    padding: var(--gutter) 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* Panels */
  .panel {
    border: 1px solid #2a2820;
    padding: 1.5rem;
    background: #0e0f12;
    position: relative;
  }

  .panel-label {
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
  }

  /* Faction panel — full width */
  .faction-panel {
    grid-column: 1 / -1;
  }

  .factions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .faction-card {
    background: #0b0c0f;
    border: 1px solid #2a2820;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    position: relative;
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: inherit;
  }

  .faction-card:hover:not(:disabled):not(.selected):not(.taken) {
    border-color: #4a4538;
    background: var(--bg-primary);
    cursor: pointer;
  }

  .faction-card.selected.necro {
    border-color: var(--necro);
    background-color: var(--necro-darkest);
  }

  .faction-card.selected.crown {
    border-color: var(--crown);
    background-color: var(--crown-darkest);
  }

  .faction-card.taken {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .faction-card.locked {
    cursor: default;
  }

  .faction-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--font-color);
    letter-spacing: 0.05em;
  }

  .faction-desc {
    font-size: 0.8rem;
    color: var(--font-color-soft);
    line-height: 1.5;
  }

  .faction-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--font-color-soft);
    border: 1px solid #2a2820;
    padding: 2px 8px;
  }

  .players-panel {
    grid-column: 1 / -1;
  }

  /* Players */
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .player-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid #1a1b1e;
  }

  .player-row.waiting {
    opacity: 0.35;
  }

  .player-tag {
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--font-color-soft);
    min-width: 64px;
  }

  .player-row.self.crown .player-tag {
    color: var(--crown);
  }
  .player-row.self.necro .player-tag {
    color: var(--necro);
  }

  .player-faction {
    flex: 1;
    font-size: 0.85rem;
    color: var(--font-color-grey);
  }

  .ready-pip {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2a2820;
    border: 1px solid #3a3830;
    transition: background 0.3s, border-color 0.3s;
  }

  .ready-pip.ready {
    background: #7a9e6e;
    border-color: #7a9e6e;
    box-shadow: 0 0 6px #7a9e6e88;
  }

  /* Config */
  .config-rows {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .config-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    cursor: default;
  }

  .config-label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--font-color-grey);
  }

  .config-control {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .config-control input[type="range"] {
    flex: 1;
    appearance: none;
    height: 2px;
    background: #2a2820;
    outline: none;
    cursor: pointer;
  }

  .config-control input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 0;
    cursor: pointer;
  }

  .config-value {
    font-size: 0.85rem;
    min-width: 36px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* Ready row — full width */
  .ready-row {
    grid-column: 1 / -1;
    gap: 16px;
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }

  .ready-btn {
    border: 1px solid var(--primary);
    color: var(--primary);
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    position: relative;
  }

  .btn::before {
    content: "";
    position: absolute;
    bottom: 0; left: 0;
    height: 2px;
    width: 0;
    background: var(--font-color);
    transition: width 0.3s ease;
  }

  .ready-btn:hover:not(:disabled)::before {
    width: 100%;
  }

  .ready-btn:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
  }

  .ready-btn:disabled {
    cursor: default;
    opacity: 0.5;
  }

  .ready-btn.all-ready {
    border-color: #7a9e6e;
    color: #7a9e6e;
    animation: breathe 1.5s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .start-cards-buttons {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }
  .start-cards-buttons .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-secondary);
    padding: 15px;
    border: 1px solid var(--font-color-soft);
    border-bottom: none;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  .start-cards-buttons img {
    height: 120px;
    width: auto;
    object-fit: contain;
  }
  .start-cards-buttons .start-cards-button {
    display: flex;
    flex-direction: column;
  }
  .start-cards-buttons .button-group {
    display: flex;
    justify-content: center;
  }
  .start-cards-button button {
    width: 50%;
    padding: 5px 10px;
  }
  .start-cards-button button:first-child {
    border-bottom-left-radius: 8px;
  }
  .start-cards-button button:last-child {
    border-bottom-right-radius: 8px;
  }
  .start-deck h3 {
    margin-bottom: 16px;
    margin-top: 24px;
  }
  .start-deck-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .start-deck-cards .card-image-container {
    border-radius: 8px;
    padding: 8px 16px;
    width: 90px;
    background-color: var(--font-color-grey);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .start-deck-cards img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
</style>
