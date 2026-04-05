<script lang="ts">
  import { Modal } from "$UI/Modal";
  import { StaticCard } from "$UI/Token";
  import { type Card } from "@necro-crown/shared";

  export let cards: Card[] | undefined;

  let showModal = false;

  $: count = cards?.length ?? 0;
  $: topCard = cards && cards.length > 0 ? cards[cards.length - 1] : null;

  // show small stacked pile of up-to `maxStack` previous cards
  const maxStack = 6;

  // deterministic small rotation based on id/index
  const rotationFor = (c: Card | undefined, idx: number) => {
    const seed = (c?.id ?? idx) * 9973;
    return ((seed % 11) - 5) + (idx % 2 === 0 ? 5 : -5); // ~ -5..+5 deg
  };

  const handleKey = (e: KeyboardEvent) => {
    console.log('open me')
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      showModal = true;
    }
  };
</script>

<div
  class="discard-container"
  role="button"
  tabindex={0}
  aria-label="Open discard pile"
  title="Open discard pile"
  on:click={() => showModal = true}
  on:keydown={handleKey}
>
  <div class="pile" aria-hidden={count === 0}>
    {#if count > 1}
      {#each Array(Math.min(count - 1, maxStack)).fill(0).map((_, i) => {
        const fromIndex = Math.max(0, (cards?.length ?? 1) - 2 - i);
        const c = cards?.[fromIndex];
        const rot = rotationFor(c, fromIndex);
        return { c, rot, idx: i };
      }) as item}
        <div
          class="card-back"
          style="transform: rotate({item.rot}deg); z-index: {item.idx}"
        />
      {/each}
    {/if}

    <div class="top-card" style="z-index: 999">
      {#if topCard}
        <StaticCard unitName={topCard.name} />
      {:else}
        <div class="empty">Discard</div>
      {/if}
    </div>
  </div>

  <div class="count" aria-hidden="true">{count}</div>
</div>

<Modal bind:open={showModal} width={"600px"} title={"Discarded Cards"}>
  {#if cards && cards.length > 0}
    <div class="modal-grid">
      {#each [...cards].reverse() as card (card.id)}
        <StaticCard unitName={card.name} />
      {/each}
    </div>
  {:else}
    <div class="empty-list">No discarded cards</div>
  {/if}
</Modal>

<style>
  .discard-container {
    pointer-events: all;
    position: relative;
    width: 60px;
    height: 100px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    padding: 6px;
    box-sizing: border-box;
    opacity: 0.8;
  }

  .pile {
    width: 60px;
    height: 100px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  /* small stylized back for stacked cards */
  .card-back {
    position: absolute;
    width: 60px;
    height: 100px;
    border-radius: 5px;
    background-color: #ddd;
    border: 2px solid #555;
    transform-origin: center;
    transition: transform 120ms ease;
  }

  .top-card {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .top-card .empty {
    position: absolute;
    padding: 5px;
  }

  .empty {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    text-align: center;
  }

  .count {
    position: absolute;
    right: -8px;
    bottom: -8px;
    background: var(--accent, #222);
    color: white;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 12px;
    z-index: 999;
  }

  .modal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    max-height: 60vh;
    overflow: auto;
  }
  .empty-list {
    padding: 24px;
    text-align: center;
    color: rgba(255,255,255,0.6);
  }
</style>