<script lang="ts">
  import { units } from "$shared/data/units";
  export let cost: number;
  export let unitID: string;
  import CoinPurse from "$icons/CoinPurse.svelte";

  const test = units[unitID];
</script>

<div class="token">
  <div class="cost">
    <CoinPurse value={cost} />
  </div>
  <img src={test.url} alt="" />
</div>

<style>
  .token {
    position: relative;
    border: 2px solid #555;
    border-radius: 5px;
    width: 75px;
    height: 130px;
    text-align: center;
    padding: 5px;
    margin: 15px;
    background-color: white;
  }
  .token:hover {
    cursor: pointer;
  }

  .token img {
    max-width: 100%;
    max-height: 100%;
  }

  .cost {
    position: absolute;
    left: -15px;
    top: -15px;
  }
</style>
