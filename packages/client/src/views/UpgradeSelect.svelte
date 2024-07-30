<script lang="ts">
  import { StatName, type Upgrade } from "@necro-crown/shared";

  type Option = {
    id: string;
    title: string;
    description: string;
    imageURL?: string;
  }

  export let options: Upgrade[];
  export let onSelect: (stat: StatName) => void = (stat: StatName) => console.log(StatName[stat]);
</script>

<div class="upgrade-select">
  <div class="upgrade-options">
    {#each options as option}
      <button class="option" on:click={() => onSelect(option.stat)}>{option.title}</button>
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
        width: 50%;
        background-color: #333;
        border-radius: 5px;
        border: 2px solid black;
        padding: 20px 15px;
      }
    }
  }
</style>
