<script lang="ts">
  // import { Card } from "$components/Card"
  import { Faction } from "@necro-crown/shared";
  export let playMultiplayerAs: (player: Faction) => void;
  export let playSoloAs: (player: Faction) => void;
</script>

<div class="menu">
  <h1>NECRO vs CROWN</h1>
  <!--Card color='red' /-->

  <div class="actions">
    <div>
      <h2>Play Multiplayer</h2>
      <button on:click={() => playMultiplayerAs(Faction.Necro)}>Join as Necro</button>
      <button on:click={() => playMultiplayerAs(Faction.Crown)}>Join as Crown</button>
    </div>
    <div>
      <h2>Play Solo</h2>
      <button on:click={() => playSoloAs(Faction.Necro)}>Play as Necro</button>
      <button on:click={() => playSoloAs(Faction.Crown)}>Play as Crown</button>
    </div>
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
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
</style>
