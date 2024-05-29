<script lang="ts">
  import { Card } from "$components/Card"
  export let playAs: (player: "necro" | "crown") => void;
  // import type { UnitData } from "@necro-crown/shared"

  let unit: UnitData;

</script>

<div class="menu">
  <h1>NECRO vs CROWN</h1>
  <Card color='red' />

  <div class="actions">
    <button on:click={() => playAs("necro")}>Join as Necro</button>
    <button on:click={() => playAs("crown")}>Join as Crown</button>
  </div>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 25px;
    gap: 15px;
  }

  .actions {
    display: flex;
    gap: 15px;
  }

</style>
