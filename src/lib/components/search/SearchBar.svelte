<script lang="ts">
	import { clearSearch, getSearchState, type SearchResult } from '$lib/stores/search-store.svelte';
	import { SearchIcon, XIcon } from '@lucide/svelte';
	import type L from 'leaflet';
	import SearchResults from './SearchResults.svelte';

	let {
		onSelect,
		onPlayerSelect,
		onResourceSelect
	}: {
		onSelect: (entry: { latlng: L.LatLng; layer: L.LayerGroup }) => void;
		onPlayerSelect: (entityId: string, username: string) => void;
		onResourceSelect: (id: number, name: string, tier: number) => void;
	} = $props();

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
			if (result) handleSelect(result);
		} else if (e.key === 'Escape') {
			clearSearch();
			inputEl?.blur();
		}
	}

	function handleSelect(entry: SearchResult): void {
		if (entry.type === 'player') {
			onPlayerSelect(entry.entityId, entry.username);
		} else if (entry.type === 'resource') {
			onResourceSelect(entry.id, entry.name, entry.tier);
			clearSearch();
		} else {
			onSelect(entry);
			clearSearch();
		}
	}
</script>

<div class="absolute top-3 left-3 z-[1000] w-96">
	<div class="relative">
		<SearchIcon size="18" color="#d1d5db" class="absolute z-10 left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
		<input
			bind:this={inputEl}
			type="text"
			placeholder="Search claims, cities, resources, players..."
			bind:value={search.query}
			onfocus={() => search.isOpen = true}
			onblur={() => setTimeout(() => search.isOpen = false, 200)}
			onkeydown={handleKeydown}
			class="w-full rounded-lg bg-[#1e2433]/95 border border-white/10 pl-8 pr-8 py-2 text-sm text-gray-200 placeholder-gray-500 backdrop-blur-sm shadow-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
		/>
		{#if search.query}
			<button
				onclick={() => clearSearch()}
				class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200"
				aria-label="Clear search"
			>
				<XIcon size="12" color="currentColor" />
			</button>
		{/if}
	</div>

	{#if search.isOpen && (search.locationResults.length > 0 || search.resourceResults.length > 0 || search.playerResults.length > 0 || search.isLoadingRemote)}
		<SearchResults
			locationResults={search.locationResults}
			resourceResults={search.resourceResults}
			playerResults={search.playerResults}
			bind:selectedIndex={search.selectedIndex}
			isLoadingRemote={search.isLoadingRemote}
			{handleSelect}
		/>
	{/if}
</div>
