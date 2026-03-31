<script lang="ts">
  import { Icon } from "$icons";
  import { page } from '$app/stores';  
  let currentPage = $page.url.pathname;

</script>

<nav class="nav">
  <div class="nav-inner">
    <div class="links">
      <a href="/" class="logo">
        <Icon color="var(--crown)" height="10px" name="crown" />
        <Icon color="var(--necro)" height="20px" name="skull" />
      </a>
      <a href="/solo" class:active={currentPage === "/solo"}>Solo</a>
      <a href="/lobby" class:active={currentPage === "/lobby"}>Versus</a>
      <a href="/lobbies" class:active={currentPage === "/lobbies"}>Lobbies</a>
    </div>
    <slot />
  </div>
</nav>

<style>
  /* Navbar */
  .nav {
    pointer-events: all;
    position: fixed;
    width: 100vw;
    top: 0;
    left: 0;
    background-color: var(--bg-primary);
    border-bottom: 1px solid #2a2820;
    z-index: 1;
  }

  .nav-inner {
    max-width: var(--max-width);
    padding: 8px var(--gutter);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .nav-inner .links {
    display: flex;
    gap: 8px;
  }

  .nav-inner .links .logo {
    display: flex;
    flex-direction: column;
    padding-bottom: 5px;
    margin-right: 8px;
  }

  .nav-inner .links a {
    text-decoration: none;
    color: var(--primary);
    font-size: var(--font-size-sm);
    font-weight: 700;
    align-content: center;
    transition: color 0.15s ease-in;
  }
  .nav-inner .links a.active {
    color: var(--font-color-soft);
    cursor: default;
  }
  .nav-inner .links a:not(.active):hover {
    color: var(--crown);
  }
</style>
