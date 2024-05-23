<script lang="ts">

  export let play: (player: string) => void;

</script>

<div>
  <h1>NECRO</h1>

  <button on:click={() => play("necro")}>Join as Necro</button>
  <button on:click={() => play("crown")}>Join as Crown</button>
</div>