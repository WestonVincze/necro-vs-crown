<script lang="ts">
  import { StartGame } from ".";
  import { onMount } from "svelte";
  onMount(() => {
    StartGame("game-container");
  })
</script>

<div id="game-container">
  <div id="overlay"></div>
</div>
