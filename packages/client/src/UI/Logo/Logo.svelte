<script lang="ts">
  import { Icon } from "$icons";
</script>

<header>
  <div class="logo">
    <Icon color="var(--crown)" height="20px" name="crown" />
    <Icon color="var(--necro)" height="40px" name="skull" />
  </div>
  <h1>
    <span class="necro">NECRO</span>
    <span class="vs">VS</span>
    <span class="crown">CROWN</span>
  </h1>
</header>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    align-items: center;
  }
  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .necro {
    text-align: right;
    color: var(--necro);
  }
  .vs {
    font-size: 2.5rem;
  }
  .crown {
    text-align: left;
    color: var(--crown);
  }

</style>