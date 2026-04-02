<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import { pendingGameSession } from "../../stores/GameSessionStore";
  import { goto } from "$app/navigation";
  import { Faction } from "@necro-crown/shared";
  import GameUI from "../../views/GameUI/GameUI.svelte";

  const gameSession = get(pendingGameSession);
  let faction: Faction;
  let tearDown: (() => void) | null = null;

  onMount(async () => {
    const { createPhaserGame } = (await import("$game/index"));
    if (!gameSession || !gameSession.room) {
      goto("/lobby");
      return;
    }
    // Clear the store — room is now owned by this page
    pendingGameSession.set(null);

    faction = gameSession.faction;

    const game = createPhaserGame("versus")
    game.registry.set("faction", faction);
    game.registry.set("room", gameSession.room);
    game.scene.start("PreloaderScene", { gameMode: "versus" });
    tearDown = () => game.destroy(true);
  });

  onDestroy(() => tearDown?.())
</script>

<GameUI faction={faction} />