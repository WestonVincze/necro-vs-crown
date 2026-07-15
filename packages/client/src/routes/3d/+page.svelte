<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Faction } from "@necro-crown/shared";
  import { CrownUI } from "../../views/Crown";

  let container: HTMLDivElement;
  let tearDown: (() => void) | null = null;
  let faction = Faction.Necro;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("faction")?.toLowerCase() === "crown") {
      faction = Faction.Crown;
    }
    const { createThreeGame } = await import("$game/three/createThreeGame");
    tearDown = await createThreeGame(container, faction);
  });

  onDestroy(() => tearDown?.());
</script>

<div bind:this={container} class="three-container"></div>

{#if faction === Faction.Crown}
  <CrownUI />
{/if}

<style>
  .three-container {
    width: 100vw;
    height: 100vh;
    display: block;
  }
</style>
