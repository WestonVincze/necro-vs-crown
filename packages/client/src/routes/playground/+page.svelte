<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let tearDown: (() => void) | null = null;
  onMount(async () => {
    const { createPhaserGame } = (await import("$game/index"));

    const game = createPhaserGame("playground")
    game.scene.start("PreloaderScene", { gameMode: "playground" });
    tearDown = () => game.destroy(true);
  });

  onDestroy(() => tearDown?.())
</script>
