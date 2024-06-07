<script lang="ts">
  import { onMount } from "svelte";
  import type { Game } from "phaser";

  import { StartGame } from ".";
  import MainMenu from "../views/MainMenu.svelte";
  import { CrownUI } from "../views/Crown";
  import { Faction } from "@necro-crown/shared";

  let game: Game;

  onMount(() => {
    game = StartGame("game-container");
    console.log(game.scene.getScenes());
  })

  const handlePlayMultiplayer = (player: Faction) => {
    game.scene.start("GameScene", { player })
    currentScene = "GameScene";
    currentPlayer = player;
  }

  const handlePlaySolo = (player: Faction) => {
    game.scene.start("SoloModeScene", { player });
    currentScene = "SoloModeScene";
    currentPlayer = player;
  }

  $: currentScene = "MainMenu";
  let currentPlayer: Faction;
</script>

<div id="game-container">
  <div id="overlay">
    {#if currentScene === "MainMenu"}
      <MainMenu
        playMultiplayerAs={handlePlayMultiplayer}
        playSoloAs={handlePlaySolo}
      />
    {/if}

    {#if currentPlayer === Faction.Crown}
      <CrownUI />
    {/if}
  </div>
</div>

<style>
  :global(button) {
    padding: 10px 15px;
    border: none;
    outline: none;
    background-color: lightsteelblue;
    border-radius: 15px;
    color: black;
    transition: all 200ms ease-in-out;
  }
  :global(button:hover) {
    color: white;
    background-color: steelblue;
    cursor: pointer;
  }
  #game-container {
    position: relative;
    max-width: 1024px;
    max-height: 768px;
    margin: 0 auto;
  }
  #overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
