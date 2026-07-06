<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let container: HTMLDivElement;
  let tearDown: (() => void) | null = null;

  onMount(async () => {
    const { createThreeGame } = await import("$game/three/createThreeGame");
    tearDown = await createThreeGame(container);
  });

  onDestroy(() => tearDown?.());
</script>

<div bind:this={container} class="three-container"></div>

<style>
  .three-container {
    width: 100vw;
    height: 100vh;
    display: block;
  }
</style>
