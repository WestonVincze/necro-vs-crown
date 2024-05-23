<script lang="ts">
  import { onMount } from "svelte";
  import { StartGame } from ".";
  import MainMenu from "../views/MainMenu.svelte";
  import type { Game } from "phaser";

  let game: Game;
  onMount(() => {
    game = StartGame("game-container");
  })

</script>

<div id="game-container">
  <div id="overlay">
    <MainMenu play={(player) => game.scene.start("GameScene", { player })} />
  </div>
</div>
