<script lang="ts">
  import { onMount } from "svelte";
  import type { Game } from "phaser";

  import { StartGame } from ".";
  import MainMenu from "../views/MainMenu.svelte";

  let game: Game;
  onMount(() => {
    game = StartGame("game-container");
  })
</script>

<div id="game-container">
  <div id="overlay">
    <MainMenu playAs={(player) => game.scene.start("GameScene", { player })} />
  </div>
</div>
