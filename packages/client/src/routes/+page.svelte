<script lang="ts">
  import Game from "../game/Game.svelte";
  import "../styles/globals.css";
</script>

<div id="app">
  <Game />
</div>

<style>
  #app {
    min-height: 100svh;
    background-color: var(--bg-secondary);
    display: flex;
    align-items: center;
  }
</style>
