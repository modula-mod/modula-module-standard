<script lang="ts">
	export let functions: Array<{ id: string; title?: string; permission?: string }> = [];
</script>

<section class="contract-panel" data-function-panel>
	<div class="kicker">Functions</div>
	{#each functions as fn}
		<div class="row"><strong>{fn.id}</strong><span>{fn.permission}</span></div>
	{/each}
</section>

<style>
	.contract-panel { display: grid; gap: .5rem; color: var(--modula-text, CanvasText); }
	.kicker { font-size: .68rem; letter-spacing: .13em; text-transform: uppercase; color: var(--modula-muted, color-mix(in srgb, currentColor 58%, transparent)); }
	.row { display: flex; justify-content: space-between; gap: .75rem; border: 1px solid var(--modula-border, color-mix(in srgb, currentColor 14%, transparent)); border-radius: var(--modula-radius-md, 12px); padding: .6rem; }
</style>
