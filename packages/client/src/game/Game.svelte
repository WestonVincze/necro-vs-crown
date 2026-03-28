<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import MainMenu from "../views/MainMenu.svelte";
  import { CrownUI } from "../views/Crown";
  import { Faction, legacyGameEvents, type Upgrade } from "@necro-crown/shared";
  import UpgradeSelect from "../views/UpgradeSelect.svelte";
  import GameOver from "../views/GameOver.svelte";
  import type { Game } from "phaser";
  import { get, type Unsubscriber } from "svelte/store";

  let game: Game | null = null;
  let unsubscriber: Unsubscriber;
  let errorMsg: string = "";

  $: upgrade = {
    active: false,
    options: [] as Upgrade[],
  }
  let handleUpgradeSelect: (upgradeId: number) => void;

  onMount(async () => {
    const { gameReference } = (await import ("../stores/GameSessionStore"))
    game = get(gameReference);

    if (!game) {
      unsubscriber = gameReference.subscribe(g => {
        if (!g) return;
        game = g;
      })
    }
  })

  const levelUpSubscription = legacyGameEvents.onUpgradeRequest.subscribe(({ eid, upgrades }) => {
    upgrade.active = true;
    upgrade.options = upgrades;

    handleUpgradeSelect = (upgradeId: number) => {
      upgrade.options = [];
      upgrade.active = false;
      legacyGameEvents.emitUpgradeSelect({ eid, upgradeId });
    }
  });

  const gameOverSubscription = legacyGameEvents.onGameOver.subscribe(() => {
    if (!game) return;
    game.scene.start("GameOverScene");
    currentScene = "GameOver";
  });

  const handlePlayAs = (faction: Faction) => {
    if (!game) return;
    currentPlayer = faction;
    if (!currentPlayer) {
      errorMsg = "Please select a player type."
      return;
    }
    errorMsg = "";
    // game.registry.set("faction", currentPlayer);
    game.scene.start("SoloModeScene", { player: faction });
    currentScene = "SoloMode";
  }

  const handleMainMenu = () => {
    if (!game) return;
    game.scene.start("MainMenuScene");
    currentScene = "MainMenu";
  }

  $: currentScene = "MainMenu";

  let currentPlayer: Faction;

  onDestroy(() => {
    // emit scene's destroy event for cleanup
    if (!game) return;
    game.destroy(true);
    levelUpSubscription.unsubscribe();
    gameOverSubscription.unsubscribe();
    unsubscriber?.();
  });
</script>

<div class="game">
  {#if currentScene === "MainMenu"}
    <MainMenu
      playAs={handlePlayAs}
    />
  {:else if currentScene === "GameOver"}
    <GameOver
      onPlayAgain={() => handlePlayAs(currentPlayer)}
      onMainMenu={handleMainMenu}
    />
  {:else}
    {#if currentPlayer === Faction.Crown}
      <CrownUI />
    {/if}

    {#if upgrade.active}
      <UpgradeSelect options={upgrade.options} onSelect={handleUpgradeSelect} />
    {/if}
  {/if}
  {#if errorMsg}
    <div class="errorMsg">{errorMsg}</div>
  {/if}
</div>

<style>
  .game {
    width: 100%;
    height: 100%;
  }
  .errorMsg {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    padding: 10px 15px;
    color: var(--error);
  }
</style>
