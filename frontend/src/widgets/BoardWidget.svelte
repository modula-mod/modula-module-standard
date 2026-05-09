<script lang="ts">
	export let title = 'Example Board Widget';
	export let subtitle = 'Module widget contract is active';
</script>

<section class="modula-module-widget" data-module-widget="example-board-widget">
	<div class="kicker">Widget</div>
	<strong>{title}</strong>
	<p>{subtitle}</p>
</section>

<style>
	.modula-module-widget {
		display: grid;
		gap: 0.35rem;
		border-radius: var(--modula-radius-lg, 16px);
		border: 1px solid var(--modula-border, color-mix(in srgb, currentColor 14%, transparent));
		background: var(--modula-surface, color-mix(in srgb, Canvas 86%, transparent));
		color: var(--modula-text, CanvasText);
		padding: 1rem;
	}

	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--modula-muted, color-mix(in srgb, currentColor 58%, transparent));
	}

	p {
		margin: 0;
		color: var(--modula-muted, color-mix(in srgb, currentColor 58%, transparent));
	}
</style>
