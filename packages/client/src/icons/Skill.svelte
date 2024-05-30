<script lang="ts">
  export let color: string;
  export let value: string;
  export let flipped: boolean = false;
</script>

<svg class:flipped width="36px" height="24px" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="shape" d="M 0,5 l 5,-5 H 36 q -12,12 0,24 H 5 l -5 -5 z" fill="white" />
    <clipPath id="clip">
      <use href="#shape" />
    </clipPath>
  </defs>
  <g>

  <use href="#shape" stroke={color} stroke-width="4" clip-path="url(#clip)" />
  <text x={flipped ? 10 : 26} y="55%" text-anchor="end" dominant-baseline="middle" font-size="16px" font-weight=600>{value}</text>
  </g>
</svg>

<style>
  text {
    line-height: 16px;
    text-align: center;
    color: black;
  }
  g {
    display: flex;
  }
  .flipped use {
    transform-origin: center;
    transform: rotate(180deg);
  } 
  .flipped text {
    text-anchor: start;
  }
</style>
