<script lang="ts">
  import "../styles/globals.css";
</script>

<div id="app">
  <div id="ui">
    <slot />
  </div>
  <div id="game-container"></div>
</div>

<style>
  #app {
    min-height: 100svh;
    background-color: var(--bg-primary);
  }
  #ui {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  #game-container {
    width: 100svw;
    height: 100svh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>