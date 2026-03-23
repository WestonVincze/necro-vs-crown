<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import MainMenu from "../views/MainMenu.svelte";
  import { CrownUI } from "../views/Crown";
  import { Faction, legacyGameEvents, type Upgrade } from "@necro-crown/shared";
  import UpgradeSelect from "../views/UpgradeSelect.svelte";
  import GameOver from "../views/GameOver.svelte";
  import type { Game } from "phaser";

  let game: Game | null = null;

  $: upgrade = {
    active: false,
    options: [] as Upgrade[],
  }
  let handleUpgradeSelect: (upgradeId: number) => void;

  onMount(async () => {
    const { StartGame } = (await import('./'));
    game = StartGame("game-container");
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

  const handlePlayAs = (player: Faction, gameMode: "solo" | "versus") => {
    if (!game) return;
    currentPlayer = player;
    if (gameMode === "versus") {
      game.scene.start("VersusModeScene", { player })
      currentScene = "VersusMode";
    } else {
      game.scene.start("SoloModeScene", { player });
      currentScene = "SoloMode";
    }
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
  });
</script>

<div id="game-container">
  <div id="overlay">
    {#if currentScene === "MainMenu"}
      <MainMenu
        playAs={handlePlayAs}
      />
    {:else if currentScene === "GameOver"}
      <GameOver
        onPlayAgain={() => handlePlayAs(currentPlayer, "solo")}
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
  </div>
</div>

<style>
  #game-container {
    position: relative;
    max-width: 1024px;
    max-height: 768px;
    height: 640px;
    margin: 0 auto;
    filter: drop-shadow(0 0 25px var(--bg-primary))
  }
  #overlay {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
