<script lang="ts">
  import { Faction } from "@necro-crown/shared";
  import { Icon } from "$icons";
  import { Logo } from "$UI/Logo";
  export let playAs: (player: Faction) => void;
</script>

<div class="menu">
  <Logo />
  <div class="player-select">
    <button class="necro" on:click={() => playAs(Faction.Necro)}>
      <Icon height="30px" name="skull" />
      <span>Play as Necro</span>
    </button>
    <button class="crown" on:click={() => playAs(Faction.Crown)}>
      <Icon height="30px" name="crown" />
      <span>Play as Crown</span>
    </button>
  </div>
</div>

<style>
  .menu {
    height: 100%;
    width: 100%;
    background-color: var(--bg-primary);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 25px;
    gap: 15px;
  }

  .player-select {
    display: flex;
  }
  .player-select button { 
    width: 200px;
    opacity: 0.5;
    color: var(--primary);
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 5px;
    flex-direction: column;
    border: none;
  }
  .player-select button:hover {
    opacity: 0.85;
  }
  .necro {
    background-color: var(--necro-dark);
  }
  .crown {
    background-color: var(--crown-dark);
  }
</style>
