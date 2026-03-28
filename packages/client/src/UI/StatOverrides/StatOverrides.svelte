<script lang="ts">
  import { StatName, UnitName, Units, type Stats } from "@necro-crown/shared";

  /** Outputs a partial override record — bind this to your gameConfig */
  export let overrides: Partial<Record<UnitName, Partial<Stats>>> = {};
  export let onChange: (unitName: UnitName, stats: Partial<Stats>) => void;
  export let onReset: () => void;

  // ---- State ----

  const unitNames = Object.keys(Units) as UnitName[];
  let selected: UnitName = unitNames[0];

  $: unit = Units[selected];

  $: statEntries = Object.entries(mergedStats) as [StatName, number][];

  // Merged view: base stats with any saved overrides applied
  $: mergedStats = {
    ...unit.stats,
    ...(overrides[selected] ?? {}),
  } as Stats;

  function handleChange(stat: StatName, raw: string) {
    const value = parseFloat(raw);
    if (isNaN(value)) return;

    const base = unit.stats[stat];

    // If the value matches base, remove the override entirely
    const currentOverrides = { ...(overrides[selected] ?? {}) };
    if (value === base) {
      delete currentOverrides[stat];
    } else {
      currentOverrides[stat] = value;
    }

    // Remove the unit entry if no overrides remain
    const next = { ...overrides };
    if (Object.keys(currentOverrides).length === 0) {
      delete next[selected];
    } else {
      next[selected] = currentOverrides;
    }

    overrides = next;
    onChange(selected, currentOverrides);
  }

  function resetUnit() {
    const next = { ...overrides };
    delete next[selected];
    overrides = next;
    onChange(selected, {});
  }

  function resetAll() {
    overrides = {};
    onReset();
  }

  $: hasUnitOverride = !!overrides[selected];
  $: hasAnyOverride = Object.keys(overrides).length > 0;

  function isOverridden(stat: StatName): boolean {
    return overrides[selected]?.[stat] !== undefined;
  }
</script>

<div class="modifier">
  <!-- Unit tabs -->
  <div class="tabs" role="tablist">
    {#each unitNames as name}
      <button
        class="tab"
        class:active={selected === name}
        class:dirty={!!overrides[name]}
        role="tab"
        aria-selected={selected === name}
        on:click={() => (selected = name)}
      >
        {Units[name].name}
        {#if overrides[name]}
          <span class="dirty-dot" title="Has overrides" />
        {/if}
      </button>
    {/each}
  </div>

  <!-- Unit display -->
  <div class="unit-body">
    <div class="unit-preview">
      <div class="unit-image-container">
        {#key selected}
          <img
            src={unit.url}
            alt={unit.name}
            width={unit.width * 2}
            height={unit.height * 2}
            class="unit-image"
          />
        {/key}
      </div>
      <div class="unit-meta">
        <span class="unit-name">{unit.name}</span>
        <span class="unit-size">{unit.width}×{unit.height}</span>
      </div>
    </div>

    <!-- Stat form -->
    <div class="stats">
      {#each statEntries as [stat, value]}
        {@const base = unit.stats[stat]}
        {@const modified = isOverridden(stat)}

        <label class="stat-row" class:modified>
          <span class="stat-name">{stat}</span>
          <span class="stat-base" class:hidden={!modified} title="Base value">
            {base}
          </span>
          <input
            class="stat-input"
            value={value}
            on:change={(e) => handleChange(stat, e.currentTarget.value)}
          />
        </label>
      {/each}
    </div>
  </div>

  <!-- Actions -->
  <div class="actions">
    <button class="btn" disabled={!hasUnitOverride} on:click={resetUnit}>
      Reset {unit.name}
    </button>
    <button class="btn" disabled={!hasAnyOverride} on:click={resetAll}>
      Reset all
    </button>
  </div>
</div>

<style>
  .modifier {
    font-family: sans-serif;
    font-size: 0.875rem;
    color: #e0e0e0;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
    max-width: 420px;
  }

  /* Tabs */
  .tabs {
    display: flex;
    flex-wrap: wrap;
    background: #111;
  }

  .tab {
    flex: 1;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    border-right: 1px solid #333;
    border-bottom: 1px solid #333;
    color: #888;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: color 0.1s, background 0.1s;
  }

  .tab:last-child {
    border-right: none;
  }

  .tab:hover {
    color: #ccc;
    background: #1a1a1a;
  }

  .tab.active {
    color: #fff;
    background: #1a1a1a;
    border-bottom: 2px solid var(--crown);
    margin-bottom: -1px;
  }

  .dirty-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--crown);
    flex-shrink: 0;
  }

  /* Body */
  .unit-body {
    display: flex;
    gap: 1rem;
    padding: 1rem;
  }

  .unit-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .unit-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 230px;
    border: 1px solid #333;
    background: #111;
  }

  .unit-image {
    object-fit: contain;
    image-rendering: pixelated;
    padding: 4px;
    border-radius: 4px;
  }

  .unit-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .unit-name {
    font-weight: 600;
    color: var(--primary);
    font-size: 0.8rem;
  }

  .unit-size {
    font-size: 0.7rem;
    color: var(--font-color-soft);
  }

  /* Stats */
  .stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .stat-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-name {
    color: var(--font-color);
    font-size: 0.8rem;
  }

  .stat-row.modified .stat-name {
    color: var(--crown);
  }

  .stat-base {
    font-size: 0.75rem;
    color: var(--font-color);
    text-decoration: line-through;
    text-decoration-color: var(--error);
    min-width: 24px;
    text-align: right;
  }

  .stat-base.hidden {
    visibility: hidden;
  }

  .stat-input {
    width: 64px;
    background: var(--bg-primary);
    border: 1px solid var(--bg-secondary);
    border-radius: 3px;
    color: var(--primary);
    font-size: 0.8rem;
    padding: 3px 6px;
    text-align: right;
    outline: none;
  }

  .stat-row.modified .stat-input {
    border-color: var(--crown);
    color: var(--crown);
  }

  .stat-input:focus {
    border-color: var(--necro);
  }

  /* Actions */
  .actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--bg-secondary);
    background: var(--bg-primary);
    justify-content: flex-end;
  }

  .btn {
    background: none;
    border: 1px solid var(--font-color-soft);
    border-radius: 3px;
    color: var(--font-color-soft);
    font-size: 0.75rem;
    padding: 4px 12px;
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s;
  }

  .btn:hover:not(:disabled) {
    color: #ccc;
    border-color: #888;
  }

  .btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
<!--
<script lang="ts">
  import { Units } from "@necro-crown/shared";
  import { assets } from "../stores/AssetStore";

  // define all game settings
  console.log(assets)
  /*
  [UnitName]: { baseStats, imgUrl }
  Unit Name => { sprite texture, base stats }
  */
  const units = Object.values(Units).map(u => u)
  console.log(units);

</script>

<p>All assets</p>
{#each units as unit}
  <img src={unit.url} alt="">
{/each}

<style>
  img {
    height: 150px;
  }
</style>

-->