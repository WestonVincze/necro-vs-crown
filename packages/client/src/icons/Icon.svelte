<script context="module">
  import { pathsByName } from "./icon-paths";
  export const iconOptions = Object.keys(pathsByName);
  export const directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
</script>

<script lang="ts">
  export let name: keyof typeof pathsByName;
  export let direction = "n";
  export let width = "auto";
  export let height = "auto";
  export let color = "currentcolor";

  $: paths = pathsByName[name]?.paths || [];
  $: viewBox = pathsByName[name]?.viewBox || "0 0 25 25";
  $: rotation = directions.indexOf(direction) * 45;
</script>

<svg
  class="c"
  {viewBox}
  fill-rule="evenodd"
  clip-rule="evenodd"
  {color}
  style={`
    width: ${width};
    height: ${height};
    transform: rotate(${rotation}deg);
  `}>
  {#each paths as path}
    <path d={path} />
  {/each}
</svg>

<style>
  .c {
    fill: currentColor;
    transition: all 0.3s ease-out;
    overflow: visible;
  }
</style>