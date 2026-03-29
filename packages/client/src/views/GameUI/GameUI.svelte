<script lang="ts">
  import { pendingUpgrade } from "../../stores/GameEventStore";
  import { Modal } from "$UI/Modal";

  function select(optionId: number) {
    $pendingUpgrade?.onSelect(optionId);
  }
</script>

<Modal open={!!$pendingUpgrade} title="Choose an upgrade">
  {#if $pendingUpgrade}
    {#each $pendingUpgrade?.options ?? [] as option}
      <button on:click={() => select(option.id)}>
        <h3>{option.type} - {option.unitName}</h3>
        <p>{option.description}</p>
      </button>
    {/each}
  {/if}
</Modal>
