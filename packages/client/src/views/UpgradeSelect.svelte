<script lang="ts">
  import { StatName, UnitName, type Upgrade } from "@necro-crown/shared";

  export let options: Upgrade[];
  export let onSelect: (upgradeId: number) => void = (upgradeId: number) => console.log(upgradeId);
</script>

<div class="upgrade-select">
  <div class="upgrade-options">
    {#each options as option}
      <button class="option" on:click={() => onSelect(option.id)}>
        <header>
          All {UnitName[option.unitName]} Units
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
  .upgrade-select {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0,0,0,0.4);

    .upgrade-options {
      display: flex;
        gap: 15px;

      .option {
        width: 200px;
        background-color: #333;
        border-radius: 5px;
        border: 2px solid black;
        padding: 20px 15px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        header {
          font-weight: bold;
        }
      }
    }
  }
</style>
