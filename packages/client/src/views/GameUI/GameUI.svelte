<script lang="ts">
  import { pendingUpgrade } from "../../stores/GameEventStore";
  import { Modal } from "$UI/Modal";

  function select(optionId: string) {
    $pendingUpgrade?.onSelect(optionId);
  }
</script>

<Modal open={!!$pendingUpgrade} title="Choose an upgrade">
  {#each $pendingUpgrade?.options ?? [] as option}
    <button on:click={() => select(option.id)}>
      {option.label}
    </button>
  {/each}
</Modal>