<script lang="ts">
  import Skill from "$icons/Skill.svelte";
  export let color: string;
  const stats = [
    "15",
    "14",
    "13",
    "12",
    "100",
    "8"
  ]

  /**
   * header
   * - cost
   *   - wrapped in bag SVG
   * - name
   * - unit type
   * - banner (might denote rarity)
   * stats-left
   * - value 
   * - icon
   * card art
   * - image (animated?)
   * stats-right
   * - icon
   * - value
   * details
   * - description
   * item drops
   * - icons
   * 
  */
</script>

<div class="container">
  <div class="banner">
    <!-- cost -->
    <!-- name -->
    <!-- type -->
  </div>

  <div class="body">
    <div class="stats stats-left">
      {#each stats as stat}
        <div class="stat">
          <Skill color="red" value={stat} />
        </div>
      {/each}

    </div>

    <div class="card-art">

    </div>

    <div class="stats stats-right">
      {#each stats as stat}
        <div class="stat">
          <Skill color="red" value={stat} />
        </div>
      {/each}
    </div>

  </div>

  <div class="details">
    <!-- description -->
  </div>

  <div class="drops">

  </div>
</div>

<style>
  .container { 
    --primary: red;
    width: 230px;
    height: 300px;
    border: 2px solid var(--primary); 
    border-radius: 5px;
  }

  .stats {
    display: flex;
  }
  .stats > * {
    width: 34px;
  }

</style>