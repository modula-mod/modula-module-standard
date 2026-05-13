<script lang="ts">
	export let modula: Record<string, unknown> = {};
</script>

<section class="modula-plugin-surface">
	<h2>Example Plugin Surface</h2>
	<p>This plugin extends the parent module through the package registry contract.</p>
	<pre>{JSON.stringify(modula?.surface ?? {}, null, 2)}</pre>
</section>
