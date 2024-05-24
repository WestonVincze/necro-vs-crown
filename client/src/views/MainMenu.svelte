<script lang="ts">
  import { Card } from "$components/Card";


  export let playAs: (player: "necro" | "crown") => void;

</script>

<div>
  <h1>NECRO vs CROWN</h1>

  <button on:click={() => playAs("necro")}>Join as Necro</button>
  <button on:click={() => playAs("crown")}>Join as Crown</button>
  <Card color="red" />
</div>
