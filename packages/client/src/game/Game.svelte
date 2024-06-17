<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Game } from "phaser";

  import { StartGame } from ".";
  import MainMenu from "../views/MainMenu.svelte";
  import { CrownUI } from "../views/Crown";
  import { Faction } from "@necro-crown/shared";

  let game: Game;

  onMount(() => {
    game = StartGame("game-container");
  })

  onDestroy(() => {
    // emit scene's destroy event for cleanup
    game.scene.destroy();
  });

  const handlePlayAs = (player: Faction, gameMode: "solo" | "versus") => {
    currentPlayer = player;
    if (gameMode === "versus") {
      game.scene.start("VersusModeScene", { player })
      currentScene = "VersusMode";
    } else {
      game.scene.start("SoloModeScene", { player });
      currentScene = "SoloMode";
    }
  }

  $: currentScene = "MainMenu";
  let currentPlayer: Faction;
</script>

<div id="game-container">
  <div id="overlay">
    {#if currentScene === "MainMenu"}
      <MainMenu
        playAs={handlePlayAs}
      />
    {/if}

    {#if currentPlayer === Faction.Crown}
      <CrownUI />
    {/if}
  </div>
</div>

<style>
  #game-container {
    position: relative;
    max-width: 1024px;
    max-height: 768px;
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
