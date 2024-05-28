<script lang="ts">
  import { Token } from "$components/Token";
  import CoinPurse from "$icons/CoinPurse.svelte";
  import { crownState$, playCard, drawCard, discardCard, addNewCards } from "$game/Crown";
  import { interval, take } from "rxjs";


  /**
   * drawing cards should be managed in Cards.ts, but for now this simulates some animation so drawing is not instantaneous
  */
  $: crownState$;
  interval(200).pipe(
    take(4)
  ).subscribe(() => drawCard())

</script>

<div class="UI">
  <div class="actions">
    <h2>debug buttons</h2>
    <button on:click={drawCard}>Draw Card</button>
    <button on:click={() => addNewCards([ { UnitID: "paladin", cost: 5 }])}>Draw Card</button>
  </div>
  <div class="bottom">
    <div class="coins">
      <CoinPurse value={$crownState$.coins} />
    </div>
    <div class="tokens">
      {#each $crownState$.hand as card (card.id)}
        <span class="card-wrapper" class:not-playable={$crownState$.coins < card.cost} on:click={() => playCard(card.id)} role="button" tabindex={0} on:keydown={(e) => e.key === "spacebar" && discardCard(card.id)}>
          <Token cost={card.cost} unitID={card.UnitID} />
        </span>
      {/each}
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

  .tokens {
    display: flex;
    flex-direction: row;
  }

  .card-wrapper.not-playable{
    opacity: 0.6;
  }

  .card-wrapper:focus {
    outline: 1px solid red;
  }
</style>

