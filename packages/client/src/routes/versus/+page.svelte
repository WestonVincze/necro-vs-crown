<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { gameReference, pendingGameSession } from "../../stores/GameSessionStore";
  import { goto } from "$app/navigation";
  import { Faction } from "@necro-crown/shared";
  import { CrownUI } from "../../views/Crown";

  const gameSession = get(pendingGameSession);
  let faction: Faction;

  onMount(async () => {
    if (!gameSession || !gameSession.room) {
      goto("/lobby");
      return;
    }
    // Clear the store — room is now owned by this page
    pendingGameSession.set(null);

    faction = gameSession.faction;

    const game = get(gameReference);
    if (!game) {
      console.error("Game reference not found.")
    }
    game?.registry.set("faction", faction);
    game?.registry.set("room", gameSession.room);
    game?.scene.start("PreloaderScene");
  });
</script>

<div id="overlay">
  {#if faction === Faction.Crown}
    <CrownUI />
  {/if}
</div>

<style>
  #overlay {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>