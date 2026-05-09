<script lang="ts">
	export let notifications: Array<{ id: string; title?: string; default_enabled?: boolean }> = [];
</script>

<section class="contract-panel" data-notification-panel>
	<div class="kicker">Notifications</div>
	{#each notifications as channel}
		<div class="row"><strong>{channel.id}</strong><span>{channel.default_enabled ? 'enabled' : 'off'}</span></div>
	{/each}
</section>

<style>
	.contract-panel { display: grid; gap: .5rem; color: var(--modula-text, CanvasText); }
	.kicker { font-size: .68rem; letter-spacing: .13em; text-transform: uppercase; color: var(--modula-muted, color-mix(in srgb, currentColor 58%, transparent)); }
	.row { display: flex; justify-content: space-between; gap: .75rem; border: 1px solid var(--modula-border, color-mix(in srgb, currentColor 14%, transparent)); border-radius: var(--modula-radius-md, 12px); padding: .6rem; }
</style>
