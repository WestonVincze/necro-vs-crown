<script lang="ts">
  import { StatName, UnitName, type Upgrade } from "@necro-crown/shared";

  export let options: Upgrade[];
  export let onSelect: (upgradeId: number) => void = (upgradeId: number) => console.log(upgradeId);
</script>

<div class="overlay">
  <h1>LEVEL UP!</h1>
  <div class="upgrade-options">
    {#each options as option}
      <button class="option" on:click={() => onSelect(option.id)}>
        <header>
          Upgrade {UnitName[option.unitName]} Stats
        </header>
        {#each option.statUpdates as update}
          <span>
            + {update.value} {StatName[update.stat]}
          </span>
        {/each}
      </button>
    {/each}
  </div>
</div>

<style lang="scss">
  h1 {
    margin-bottom: var(--size-3);
  }
  .overlay {
    flex-direction: column;
  }
  .upgrade-options {
    display: flex;
      gap: 15px;

    .option {
      width: 240px;
      background-color: var(--necro);
      border-radius: 5px;
      border: 2px solid var(--primary);
      color: var(--primary);
      padding: 20px 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      header {
        font-weight: bold;
      }
    }
  }
</style>
