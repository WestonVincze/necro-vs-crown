<script lang="ts">
  import { Icon } from "$icons";
  import { Faction } from "@necro-crown/shared";
  import { onDestroy } from "svelte";
  import { gameOver } from "../../stores/GameEventStore";

  export let winner: Faction;
  export let time: number = 0;

  const formatTime = (ms: number) => {
    const date = new Date(ms);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    let result = "";

    if (hours > 0) {
      result += `${hours} hours `
    }
    if (minutes > 0) {
      result += `${minutes} minutes `
    }
    if (seconds > 0) {
      result += `${seconds} seconds`
    }

    return result;
  }

  onDestroy(() => $gameOver= null)
</script>

<div class="game-over {winner === Faction.Necro? "necro" : "crown"}">
  <div class="summary">
    {#if winner === Faction.Necro}
      <Icon color="var(--necro)" height="60px" name="skull" />
    {:else}
      <Icon color="var(--crown)" height="60px" name="crown" />
    {/if}

    <h1>{winner} is Victorious!</h1>

    <p>Necro survived for {formatTime(time)}.</p>

    <div class="action-btns">
      <a class="btn" href="/lobby">Back to Lobby</a>
      <a class="btn" href="/">Main Menu</a>
    </div>
  </div>
</div>

<style>
  .game-over {
    pointer-events: all; /* prevent interaction with phaser game */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 25px;
    background-color: unset;
  }
  .game-over.necro {
    background-color: var(--necro-50);
  }
  .game-over.necro .summary {
    border: 1px solid var(--necro);
  }
  .game-over.crown {
    background-color: var(--crown-50);
  }
  .game-over.crown .summary {
    border: 1px solid var(--crown);
  }
  .summary {
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: var(--max-width);
    padding: 16px var(--gutter);
    margin: 0 auto;
    background-color: var(--bg-primary);
    border-radius: 8px;
    box-shadow: 0 0 24px var(--bg-secondary);
  }
  .summary p {
    color: var(--font-color);
    text-align: center;
  }
  .summary .action-btns {
    display: flex;
    gap: 16px;
  }
  .summary a {
    flex: 1;
    text-align: center;
  }
</style>
