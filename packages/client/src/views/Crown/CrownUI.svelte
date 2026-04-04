<script lang="ts">
  import { Token } from "$UI/Token";
  import CoinPurse from "$icons/CoinPurse.svelte";
  import { crownClientState } from "$game/Crown"
  import { isPaused } from "../../stores/GameEventStore";
  import { onDestroy, onMount } from "svelte";

  $: hand = crownClientState.hand$
  $: coins = crownClientState.coins$

  const handleKeyDown = (ev: KeyboardEvent) => {
    const key = ev.key;
    const validKeys = ["1", "2", "3", "4", "Escape"];

    if (validKeys.includes(key)) {
      const idx = parseInt(key, 10) - 1;
      const currentHand = $hand as Array<{ id?: number }>;
      const card = currentHand?.[idx];
      if (card && typeof card.id !== "undefined") {
        crownClientState.selectCard(card.id);
        // focus corresponding DOM element for accessibility
        const els = Array.from(document.querySelectorAll(".card-wrapper"));
        const el = els[idx] as HTMLElement | undefined;
        el?.focus();
      }
    }

    if (key === "Escape") {
      crownClientState.deselectCard();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

</script>

  <div class="actions">
  </div>
  <div class="bottom" class:paused={$isPaused}>
    <div class="coins">
      <CoinPurse value={$coins} />
    </div>
    <div class="tokens">
      {#each $hand as card (card.id)}
        <span
          class="card-wrapper"
          class:not-playable={$coins < card.cost}
          class:selected={crownClientState.getSelectedCard()?.id === card.id}
          on:mousedown={() => card.id && crownClientState.selectCard(card.id)}
          role="button"
          tabindex={0}
          on:keydown={() => {}}
        >
          <Token cost={card.cost} unitID={card.name} />
        </span>
      {/each}
    </div>
  </div>

<style>
  .bottom {
    user-select: none;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    pointer-events: all;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .paused {
    pointer-events: none;
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
  }
  .card-wrapper.selected {
    transform: translateY(-10px);
  }
</style>
