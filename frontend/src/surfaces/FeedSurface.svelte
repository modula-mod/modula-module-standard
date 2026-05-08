<script lang="ts">
  import type { FeedItem } from '../lib/types';
  export let items: FeedItem[] = [];
</script>

<section class="surface-card">
  <h3>Feed Surface</h3>
  {#if items.length === 0}
    <p class="muted">No data yet. This is a valid empty state from backend.</p>
  {:else}
    <ul>
      {#each items as item (item.id)}
        <li>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
