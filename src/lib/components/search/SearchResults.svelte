<script lang="ts">
	import type { SearchEntry, PlayerEntry, SearchResult } from '$lib/stores/search-store.svelte';

	let {
		locationResults,
		playerResults,
		selectedIndex = $bindable(),
		isLoadingPlayers,
		handleSelect
	}: {
		locationResults: (SearchEntry & { type: 'location' })[];
		playerResults: PlayerEntry[];
		selectedIndex: number;
		isLoadingPlayers: boolean;
		handleSelect: (entry: SearchResult) => void;
	} = $props();
</script>

<div class="mt-1 max-h-64 overflow-y-auto rounded-lg bg-[#1e2433]/95 border border-white/10 shadow-xl backdrop-blur-sm">
	{#if locationResults.length > 0}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Locations
		</div>
		{#each locationResults as result, i}
			<button
				class="w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2 {i === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5'}"
				onmousedown={() => handleSelect(result)}
				onmouseenter={() => selectedIndex = i}
			>
				<svg class="w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<span>{result.title}</span>
			</button>
		{/each}
	{/if}

	{#if playerResults.length > 0 || isLoadingPlayers}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Players
			{#if isLoadingPlayers}
				<span class="ml-1 text-gray-600">...</span>
			{/if}
		</div>
		{#each playerResults as player, j}
			{@const globalIndex = locationResults.length + j}
			<button
				class="w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2 {globalIndex === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5'}"
				onmousedown={() => handleSelect(player)}
				onmouseenter={() => selectedIndex = globalIndex}
			>
				<svg class="w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
				<span
					class="inline-block w-2 h-2 rounded-full shrink-0"
					style:background-color={player.signedIn ? '#22c55e' : '#6b7280'}
					title={player.signedIn ? 'Online' : 'Offline'}
				></span>
				<span>{player.username}</span>
			</button>
		{/each}
	{/if}
</div>
