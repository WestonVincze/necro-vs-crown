<script lang="ts">
  import { Faction, Units, type Upgrade } from "@necro-crown/shared";
  import { pendingUpgrade, isPaused } from "../../stores/GameEventStore";
  import { CrownUI } from "../Crown";
  import { onDestroy } from "svelte";

  export let faction: Faction;
  $: timeRemaining = 0;
  let timer: NodeJS.Timeout | null = null;

  function select(id: string) {
    $pendingUpgrade?.onSelect(id);
  }

  function startTimer(duration: number) {
    timeRemaining = Math.floor(duration / 1000);
    timer = setInterval(() => timeRemaining -= 1, 1000);
  }

  function clearTimer() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  $: $pendingUpgrade ? startTimer($pendingUpgrade.duration) : clearTimer();

  function renderUpgradeText(upgrade: Upgrade) {
    let label = "";
    let description = "";
    if (upgrade.type === "addCard") {
      label = `Add ${upgrade.unitName} to your deck.`
      description = "Cards are shuffled back into your deck after all have been played."
    } else if (upgrade.type === "stat") {
      label = `Upgrade Stats for ${upgrade.unitName}`
      for (const entry of upgrade.statUpdates) {
        description += `Increase ${entry.name} by ${entry.value}\n`
      }
    }

    return ({ label, description });
  }

  onDestroy(() => clearTimer())
</script>

<div class="ui-container" class:waiting={$isPaused}>
  {#if $isPaused}
    <p class="paused">Waiting for server...</p>
  {/if}
  {#if $pendingUpgrade}
    <div class="upgrades">
      {#each $pendingUpgrade?.options ?? [] as option}
        {@const { label, description } = renderUpgradeText(option)}
          <button class="card" on:click={() => select(option.id)}>
            {#if option.unitName}
              <img src={Units[option.unitName].url} alt={option.unitName}>
            {/if}
            <h3>{label}</h3>
            <p>{description}</p>
          </button>
      {/each}
    </div>
    <p class:warning={timeRemaining <= 5}>{timeRemaining} seconds remaining</p>
  {/if}
  {#if faction === Faction.Crown}
    <CrownUI />
  {/if}
</div>

<style>
  .ui-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
  .ui-container.waiting {
    background-color: rgba(0,0,0,0.2);
  }
  .upgrades {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .upgrades .card {
    width: 300px;
    padding: 10px 15px;
    background-color: var(--bg-primary);
    border-radius: 8px;
  }
  .upgrades .card:hover {
    background-color: var(--bg-secondary);
  }
  .upgrades .card h3 {
    margin-bottom: 16px;
  }
  .upgrades .card img {
    max-height: 200px;
  }
  .warning {
    color: var(--error);
  }
</style>
