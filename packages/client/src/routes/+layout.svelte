<script lang="ts">
  import { onMount } from "svelte";
  import "../styles/globals.css";
  let container: HTMLDivElement;

  onMount(async () => {
    const { createPhaserGame } = (await import("$game/index"));
    const { gameReference } = (await import ("../stores/GameSessionStore"))
    const game = createPhaserGame(container);
    console.log('set game');
    gameReference.set(game);
  });
</script>

<div id="app">
  <div id="ui">
    <slot />
  </div>
  <div bind:this={container} id="game-container"></div>
</div>

<style>
  #app {
    min-height: 100svh;
    background-color: var(--bg-primary);
  }
  #ui {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  #game-container {
    width: 100svw;
    height: 100svh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>