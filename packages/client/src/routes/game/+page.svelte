<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { pendingGameSession } from "../../stores/GameSessionStore";
  import { goto } from "$app/navigation";
  import type { Game } from "phaser";
  import type { Faction } from "@necro-crown/shared";

  const gameSession = get(pendingGameSession);
  let container: HTMLDivElement;
  let game: Game | null = null;
  let faction: Faction;

  onMount(async () => {
    // Guard against direct navigation to /game without a room
    if (!gameSession || !gameSession.room) {
      goto("/lobby");
      return;
    }
    const { createPhaserGame } = (await import("$game/index"));
    // Clear the store — room is now owned by this page
    pendingGameSession.set(null);

    faction = gameSession.faction;

    game = createPhaserGame(container, gameSession.faction, gameSession.room)
    game.scene.start("PreloaderScene");
  });
</script>

<div bind:this={container} id="game-container">
</div>

<style>
  #game-container {
    position: relative;
    width: 100svw;
    height: 100svh;
    display: flex;
    justify-content: center;
    align-items: center;
    filter: drop-shadow(0 0 25px var(--bg-primary));
  }
</style>