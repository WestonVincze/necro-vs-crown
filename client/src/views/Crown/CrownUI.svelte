<script lang="ts">
  import { Token } from "$components/Token";
  import CoinPurse from "$icons/CoinPurse.svelte";
</script>

<div class="UI">
  <div class="bottom">
    <div class="coins">
      <CoinPurse value={10} />
    </div>
    <div class="tokens">
      <Token cost={5} unitID="guard" />
      <Token cost={5} unitID="guard" />
      <Token cost={5} unitID="guard" />
      <Token cost={5} unitID="guard" />
    </div>
  </div>
</div>

<style>
  .UI {
    display: grid;
    height: 100%;
  }

  .bottom {
    align-self: flex-end;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .coins {
    /* for now... */
    display: none;
  }

  .tokens {
    display: flex;
    flex-direction: row;
  }
</style>

