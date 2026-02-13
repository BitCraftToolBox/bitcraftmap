<script lang="ts">
	import type { SearchEntry } from '$lib/stores/search-store.svelte';

	let {
		results,
		selectedIndex,
		handleSelect
	}: {
		results: SearchEntry[];
		selectedIndex: number;
		handleSelect: (entry: SearchEntry) => void;
	} = $props();
</script>

<div class="mt-1 max-h-64 overflow-y-auto rounded-lg bg-[#1e2433]/95 border border-white/10 shadow-xl backdrop-blur-sm">
	{#each results as result, i}
		<button
			class="w-full text-left px-3 py-1.5 text-sm transition-colors {i === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5'}"
			onmousedown={() => handleSelect(result)}
			onmouseenter={() => selectedIndex = i}
		>
			{result.title}
		</button>
	{/each}
</div>
