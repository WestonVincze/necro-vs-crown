<script lang="ts">
  import { Faction, Necro } from "@necro-crown/shared";
  import { Icon } from "$icons";
  export let playAs: (player: Faction, gameMode: "solo" | "versus") => void;

  let faction: Faction;
</script>

<div class="menu">
  <header>
    <div class="logo">
      <Icon color="var(--crown)" height="20px" name="crown" />
      <Icon color="var(--necro)" height="40px" name="skull" />
    </div>
    <h1>
      <span class="necro">NECRO</span>
      <span class="vs">VS</span>
      <span class="crown">CROWN</span>
    </h1>
  </header>

  <div class="player-select">
    <button class="necro {faction === Faction.Necro && "selected"}"  on:click={() => faction = Faction.Necro}>
      <Icon height="30px" name="skull" />
      <span>Play as Necro</span>
    </button>
    <button class="crown {faction === Faction.Crown && "selected"}" on:click={() => faction = Faction.Crown}>
      <Icon height="30px" name="crown" />
      <span>Play as Crown</span>
    </button>
  </div>

  <div class="actions">
    <button on:click={() => playAs(faction, "solo")}>Solo</button>
    <button on:click={() => playAs(faction, "versus")}>Versus</button>
  </div>
</div>

<style lang="scss">
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

  /** HEADER */
  header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    h1 {
      display: flex;
      align-items: center;
      gap: 5px;
      .necro {
        text-align: right;
        color: var(--necro);
      }
      .vs {
        font-size: 2.5rem;
      }
      .crown {
        text-align: left;
        color: var(--crown);
      }
    }
  }

  .player-select {
    display: flex;
    button { 
      width: 200px;
      opacity: 0.5;
      color: var(--primary);
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 5px;
      flex-direction: column;
      &:hover {
        opacity: 0.85;
      }
      &.selected {
        opacity: 1;
        outline: 2px solid var(--primary);
        outline-offset: -4px;
      }
      .icon {
        width: auto;
        height: 50px;
      }
      &.necro {
        background-color: var(--necro-dark);
      }
      &.crown {
        background-color: var(--crown-dark);
      }
    }
  }

  .actions {
    display: flex;
    gap: 15px;
    text-align: center;
    button {
      background-color: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
      width: 100px;
      opacity: 0.75;
      &:hover {
        opacity: 1;
      }
    }
  }
</style>
