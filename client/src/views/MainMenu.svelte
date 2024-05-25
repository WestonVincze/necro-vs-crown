<script lang="ts">
  export let playAs: (player: "necro" | "crown") => void;
</script>

<div class="menu">
  <h1>NECRO vs CROWN</h1>

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
