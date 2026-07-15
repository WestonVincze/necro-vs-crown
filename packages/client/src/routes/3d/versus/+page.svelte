<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import { pendingGameSession } from "../../../stores/GameSessionStore";
  import { goto } from "$app/navigation";
  import { Faction } from "@necro-crown/shared";
  import { CrownUI } from "../../../views/Crown";

  const gameSession = get(pendingGameSession);
  let faction = Faction.Necro;
  let tearDown: (() => void) | null = null;

  onMount(async () => {
    if (!gameSession || !gameSession.room) {
      goto("/lobby");
      return;
    }
    pendingGameSession.set(null);

    faction = gameSession.faction;

    const { createThreeVersusGame } = await import("$game/three/createThreeVersusGame");
    tearDown = await createThreeVersusGame(
      container,
      gameSession.room,
      faction,
    );
  });

  onDestroy(() => tearDown?.());

  let container: HTMLDivElement;
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
