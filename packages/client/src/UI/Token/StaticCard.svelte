<script lang="ts">
  import { Units, UnitName, type UnitData } from "@necro-crown/shared";
  export let unitName: UnitName;

  let unitData: UnitData | undefined;
  $: unitData = Units ? Units[unitName] : undefined;
</script>

<div class="token">
  <img src={unitData?.url} alt={unitData?.name} />
</div>

<style>
  .token {
    position: relative;
    border: 2px solid #555;
    border-radius: 5px;
    width: 60px;
    height: 100px;
    text-align: center;
    padding: 5px;
    margin: 15px;
    background-color: white;
  }

  .token img {
    max-width: 100%;
    max-height: 100%;
  }
</style>
