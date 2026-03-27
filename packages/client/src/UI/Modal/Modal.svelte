<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";

  export let open = false;
  export let title = "";
  export let width = "480px";

  const dispatch = createEventDispatcher<{ close: void }>();

  function close() {
    dispatch("close");
    open = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="backdrop"
    on:click={onBackdropClick}
    transition:fade={{ duration: 150 }}
  >
    <div
      class="modal"
      style="width: {width}; max-width: calc(100vw - 2rem);"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      transition:scale={{ duration: 150, start: 0.96 }}
    >
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button class="close-btn" on:click={close} aria-label="Close">✕</button>
      </div>

      <div class="modal-body">
        <slot />
      </div>

      {#if $$slots.footer}
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--bg-primary);
    border: 1px solid var(--bg-secondary);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 4rem);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid var(--bg-secondary);
    background: var(--bg-primary);
    flex-shrink: 0;
  }

  h2 {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #555;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: color 0.1s;
    border-radius: 3px;
  }

  .close-btn:hover {
    color: #ccc;
    background: #2a2a2a;
  }

  .modal-body {
    padding: 1.25rem;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 0.875rem 1.25rem;
    border-top: 1px solid #2a2820;
    background: #111;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>