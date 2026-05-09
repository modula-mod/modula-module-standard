<script lang="ts">
	export let permissions: Array<{ id: string; description?: string; risk?: string }> = [];
</script>

<section class="contract-panel" data-permission-panel>
	<div class="kicker">Permissions</div>
	{#each permissions as permission}
		<div class="row"><strong>{permission.id}</strong><span>{permission.risk || 'low'}</span></div>
	{/each}
</section>

<style>
	.contract-panel { display: grid; gap: .5rem; color: var(--modula-text, CanvasText); }
	.kicker { font-size: .68rem; letter-spacing: .13em; text-transform: uppercase; color: var(--modula-muted, color-mix(in srgb, currentColor 58%, transparent)); }
	.row { display: flex; justify-content: space-between; gap: .75rem; border: 1px solid var(--modula-border, color-mix(in srgb, currentColor 14%, transparent)); border-radius: var(--modula-radius-md, 12px); padding: .6rem; }
</style>
