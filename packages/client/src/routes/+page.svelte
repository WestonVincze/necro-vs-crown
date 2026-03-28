<script lang="ts">
  import Logo from "$UI/Logo/Logo.svelte";
</script>

<div class="main-menu">
  <Logo />
  <div class="links">
    <a class="btn" href="/solo">Play Solo</a>
    <a class="btn" href="/lobby">Play Versus</a>
    <a class="btn" href="/lobbies">Open Lobbies</a>
  </div>
</div>

<style>
  .main-menu {
    height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .links {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .links a {
    text-align: center;
  }
</style>
