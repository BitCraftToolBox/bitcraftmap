<script lang="ts">
	import type L from 'leaflet';
	import { getSearchState, clearSearch } from '$lib/stores/search-store.svelte';
	import SearchResults from './SearchResults.svelte';

	let { onSelect }: { onSelect: (entry: { latlng: L.LatLng; layer: L.LayerGroup }) => void } = $props();

	const search = getSearchState();
	let inputEl: HTMLInputElement;

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			search.selectedIndex = Math.min(search.selectedIndex + 1, search.results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			search.selectedIndex = Math.max(search.selectedIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const result = search.results[Math.max(search.selectedIndex, 0)];
			if (result) {
				onSelect(result);
				clearSearch();
			}
		} else if (e.key === 'Escape') {
			clearSearch();
			inputEl?.blur();
		}
	}

	function handleSelect(entry: typeof search.results[0]): void {
		onSelect(entry);
		clearSearch();
	}
</script>

<div class="absolute top-3 left-3 z-[1000] w-72">
	<div class="relative">
		<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			bind:this={inputEl}
			type="text"
			placeholder="Search claims, cities..."
			bind:value={search.query}
			onfocus={() => search.isOpen = true}
			onblur={() => setTimeout(() => search.isOpen = false, 200)}
			onkeydown={handleKeydown}
			class="w-full rounded-lg bg-[#1e2433]/95 border border-white/10 pl-9 pr-8 py-2 text-sm text-gray-200 placeholder-gray-500 backdrop-blur-sm shadow-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
		/>
		{#if search.query}
			<button
				onclick={() => clearSearch()}
				class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200"
				aria-label="Clear search"
			>
				<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	{#if search.isOpen && search.results.length > 0}
		<SearchResults
			results={search.results}
			selectedIndex={search.selectedIndex}
			{handleSelect}
		/>
	{/if}
</div>
