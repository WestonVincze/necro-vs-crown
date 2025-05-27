<script lang="ts">
  export let onMainMenu: () => void;
  export let onPlayAgain: () => void;
</script>

<div class="overlay">
  <h1>Death and Damnation.</h1>
  <p>Next time for sure...</p>
  <!-- death art -->
  <button on:click={onPlayAgain}>Play Again</button>
  <button on:click={onMainMenu}>Main Menu</button>
  <svg class="blood-drip" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" preserveAspectRatio="none">
    <path
      class="drip-path-animation"
      d="M0,0 L100,0 L100,10 Q90,20 80,10 Q70,0 60,10 Q50,20 40,10 Q30,0 20,10 Q10,20 0,10 Z"
    />
  </svg>
</div>

<style lang="scss">
  .overlay {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 25px;
    background-color: unset;
  }

  button {
    background-color: var(--necro);
    color: var(--primary);
    border-radius: 8px;
  }

  button, h1, p {
    z-index: 1
  }

  .blood-drip {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    fill: #8b0000BB;
    animation-play-state: paused;
  }

  .drip-path-animation {
    animation: dripAnimation 800ms forwards;
  }

  @keyframes dripAnimation {
    0% {
      d: path("M0,0 L100,0 L100,10 Q90,20 80,10 Q70,0 60,10 Q50,20 40,10 Q30,0 20,10 Q10,20 0,10 Z");
    }
    40% {
      d: path("M0,0 L100,0 L100,40 Q90,50 80,40 Q70,30 60,40 Q50,50 40,40 Q30,30 20,40 Q10,50 0,40 Z");
    }
    100% {
      d: path("M0,0 L100,0 L100,100 Q90,100 80,100 Q70,100 60,100 Q50,100 40,100 Q30,100 20,100 Q10,100 0,100 Z");
    }
  }
</style>