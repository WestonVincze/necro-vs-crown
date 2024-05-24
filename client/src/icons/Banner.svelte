<script lang="ts">
  export let color: string = "tomato";
  export let width: number = 230;
  export let height: number = 36;

  const offset = 8;

</script>

<svg {width} {height} fill="white" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="banner" d="
      M {offset}, 0 
      L {width - offset}, 0
      q {-offset / 2}, {offset * 1.5} {offset}, {offset} 
      V {height - offset} 
      q {-offset * 1.5}, {-offset / 2} {-offset}, {offset} 
      H {offset}
      q {offset / 2}, {-offset * 1.5} {-offset}, {-offset} 
      V {offset}
      q {offset * 1.5}, {offset / 2} {offset}, {-offset}"
      fill="white"
    />
    <clipPath id="banner-clip">
      <use href="#banner" />
    </clipPath>
  </defs>
  <use href="#banner" stroke={color} stroke-width=4 clip-path="url(#banner-clip)" />
</svg>