<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>BitCraft Map</title>
</svelte:head>

{@render children()}
