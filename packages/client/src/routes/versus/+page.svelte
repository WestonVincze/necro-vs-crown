<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { pendingGameSession } from "../../stores/GameSessionStore";
  import { goto } from "$app/navigation";
  import { Faction } from "@necro-crown/shared";
  import { CrownUI } from "../../views/Crown";
  import GameUI from "../../views/GameUI/GameUI.svelte";

  const gameSession = get(pendingGameSession);
  let faction: Faction;

  onMount(async () => {
    const { createPhaserGame } = (await import("$game/index"));
    if (!gameSession || !gameSession.room) {
      goto("/lobby");
      return;
    }
    // Clear the store — room is now owned by this page
    pendingGameSession.set(null);

    faction = gameSession.faction;

    const game = createPhaserGame()
    game.registry.set("faction", faction);
    game.registry.set("room", gameSession.room);
    game.scene.start("PreloaderScene", { gameMode: "versus" });
  });
</script>

<GameUI />
{#if faction === Faction.Crown}
  <CrownUI />
{/if}