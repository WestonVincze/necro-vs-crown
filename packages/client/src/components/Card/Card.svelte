<script lang="ts">
  import Skill from "$icons/Skill.svelte";
  import Banner from "$icons/Banner.svelte";
  import CoinPurse from "$icons/CoinPurse.svelte";
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
    <Banner name="Guard">
      <CoinPurse value={5} />
    </Banner>
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
      <img src="guard.png" alt="Card art for Guard">
    </div>

    <div class="stats stats-right">
      {#each stats as stat}
        <div class="stat">
          <Skill color="red" value={stat} flipped />
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
    width: 200px;
    height: 300px;
    border: 2px solid var(--primary); 
    border-radius: 5px;
    position: relative;
    padding-top: 40px;
    margin: 0 15px;
  }

  .banner {
    position: absolute;
    left: -15px;
    top: 4px;
  }

  .body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 5px;
  }
  .stats {
    display: flex;
    flex-direction: column;
  }
  .stats > * {
    width: 34px;
  }

  .card-art {
    text-align: center;
  }
  .card-art img {
    height: 200px;
    max-width: 100%;
  }
</style>