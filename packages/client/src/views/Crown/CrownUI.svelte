<script lang="ts">
  import { Token } from "$UI/Token";
  import CoinPurse from "$icons/CoinPurse.svelte";
  import { crownState$, drawCard, discardCard, addNewCards, selectCard } from "$game/Crown";
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
    <h2>Debug Buttons</h2>
    <button on:click={() => addNewCards([ { UnitID: "Paladin", cost: 5 }])}>Add Paladin</button>
    <button on:click={() => addNewCards([ { UnitID: "Doppelsoldner", cost: 6 }])}>Add Doppelsoldner</button>
    <button on:click={() => addNewCards([ { UnitID: "Archer", cost: 6 }])}>Add Archer</button>
  </div>
  <div class="bottom">
    <div class="coins">
      <CoinPurse value={$crownState$.coins} />
    </div>
    <div class="tokens">
      {#each $crownState$.hand as card (card.id)}
        <span
          class="card-wrapper"
          class:not-playable={$crownState$.coins < card.cost}
          on:mousedown={() => selectCard(card.id)}
          role="button"
          tabindex={0}
          on:keydown={(e) =>
            // TODO: refactor - currently filler for a11y warnings
            e.key === "spacebar" && discardCard(card.id)
          }
        >
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
    pointer-events: all;
    align-self: flex-end;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tokens {
    display: flex;
    flex-direction: row;
  }

  .card-wrapper {
    transition: all 200ms ease-in-out;
  }

  .card-wrapper.not-playable{
    opacity: 0.6;
  }

  .card-wrapper:focus, .card-wrapper:focus-visible {
    outline: none;
    scale: 1.1;
  }
</style>

