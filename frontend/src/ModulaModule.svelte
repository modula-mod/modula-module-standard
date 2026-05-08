<script lang="ts">
  import './styles/module.css';
  import FeedSurface from './surfaces/FeedSurface.svelte';
  import ExploreSurface from './surfaces/ExploreSurface.svelte';
  import SettingsSurface from './surfaces/SettingsSurface.svelte';
  import { loadFeed } from './lib/api';
  import { resolveApiBase, resolveSurfaceId } from './lib/modulaContext';
  import type { ModulaContext } from './lib/types';

  export let modula: ModulaContext = {};

  let loading = true;
  let error = '';
  let items = [];

  $: apiBase = resolveApiBase(modula);
  $: surfaceId = resolveSurfaceId(modula);

  $: if (surfaceId === 'main') {
    void hydrateFeed();
  } else {
    loading = false;
  }

  async function hydrateFeed() {
    loading = true;
    error = '';
    try {
      const payload = await loadFeed(apiBase);
      items = payload.items || [];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load example feed';
    } finally {
      loading = false;
    }
  }
</script>

<section class="surface-card" data-modula-module-host>
  <div class="muted">Example Module · surface: {surfaceId} · api: {apiBase}</div>
</section>

{#if loading}
  <section class="surface-card muted">Loading surface…</section>
{:else if error}
  <section class="surface-card muted">{error}</section>
{:else if surfaceId === 'main'}
  <FeedSurface {items} />
{:else if surfaceId === 'explore'}
  <ExploreSurface />
{:else}
  <SettingsSurface />
{/if}
