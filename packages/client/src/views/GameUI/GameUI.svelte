<script lang="ts">
  import { Faction, type Upgrade } from "@necro-crown/shared";
  import { pendingUpgrade, isPaused } from "../../stores/GameEventStore";
  import { CrownUI } from "../Crown";

  export let faction: Faction;

  function select(optionId: number) {
    $pendingUpgrade?.onSelect(optionId);
  }

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

</script>

<div class="ui-container" class:waiting={$isPaused}>
  {#if $isPaused}
    <p class="paused">Waiting for server...</p>
  {/if}
  {#if $pendingUpgrade}
    {#each $pendingUpgrade?.options ?? [] as option}
      {@const { label, description } = renderUpgradeText(option)}
      <div class="upgrades">
        <button class="card" on:click={() => select(option.id)}>
          <h3>{label}</h3>
          <p>{description}</p>
        </button>
      </div>
    {/each}
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
  }
  .upgrades .card:hover {
    background-color: var(--bg-secondary);
  }
</style>
