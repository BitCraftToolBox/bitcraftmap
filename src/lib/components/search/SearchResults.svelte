<script lang="ts">
	import type {SearchEntry, PlayerEntry, ResourceEntry, CreatureSearchEntry, SearchResult, LayerEntry} from '$lib/stores/search-store.svelte';
	import { tierColors } from '$lib/config/tiers';

	let {
		locationResults,
		layerResults,
		creatureResults,
		resourceResults,
		playerResults,
		selectedIndex = $bindable(),
		isLoadingRemote,
		handleSelect
	}: {
		locationResults: (SearchEntry & { type: 'location' })[];
		layerResults: LayerEntry[];
		creatureResults: CreatureSearchEntry[];
		resourceResults: ResourceEntry[];
		playerResults: PlayerEntry[];
		selectedIndex: number;
		isLoadingRemote: boolean;
		handleSelect: (entry: SearchResult, event?: MouseEvent) => void;
	} = $props();
</script>

<div class="mt-1 max-h-[50dvh] sm:max-h-64 overflow-y-auto rounded-lg bg-[#1e2433]/95 border border-white/10 shadow-xl backdrop-blur-sm">
	{#if locationResults.length > 0}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Locations
		</div>
		{#each locationResults as result, i}
			<button
				class="w-full text-left px-3 py-2.5 sm:py-1.5 text-sm transition-colors flex items-center gap-2 {i === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
				onmousedown={(e) => { if (e.shiftKey) e.preventDefault(); handleSelect(result, e); }}
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
	{#if layerResults.length > 0}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Map Features/Layers
		</div>
		{#each layerResults as result, j}
			{@const globalIndex = locationResults.length + j}
			<button
				class="w-full text-left px-3 py-2.5 sm:py-1.5 text-sm transition-colors flex items-center gap-2 {globalIndex === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
				onmousedown={(e) => { if (e.shiftKey) e.preventDefault(); handleSelect(result, e); }}
				onmouseenter={() => selectedIndex = globalIndex}
			>
				<svg class="w-3.5 h-3.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<span>{result.title}</span>
			</button>
		{/each}
	{/if}

	{#if creatureResults.length > 0}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Creatures
		</div>
		{#each creatureResults as creature, j}
			{@const globalIndex = locationResults.length + layerResults.length + j}
			<button
				class="w-full text-left px-3 py-2.5 sm:py-1.5 text-sm transition-colors flex items-center gap-2 {globalIndex === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
				onmousedown={(e) => { if (e.shiftKey) e.preventDefault(); handleSelect(creature, e); }}
				onmouseenter={() => selectedIndex = globalIndex}
			>
				<span
					class="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
					style:background-color={tierColors[creature.tier] || '#3388ff'}
				></span>
				<span class="truncate">{creature.name}</span>
				<span class="ml-auto text-xs text-gray-600 shrink-0">T{creature.tier}</span>
			</button>
		{/each}
	{/if}

	{#if resourceResults.length > 0 || isLoadingRemote}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Resources
			{#if isLoadingRemote}
				<span class="ml-1 text-gray-600">...</span>
			{/if}
		</div>
		{#each resourceResults as resource, j}
			{@const globalIndex = locationResults.length + layerResults.length + creatureResults.length + j}
			<button
				class="w-full text-left px-3 py-2.5 sm:py-1.5 text-sm transition-colors flex items-center gap-2 {globalIndex === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
				onmousedown={(e) => { if (e.shiftKey) e.preventDefault(); handleSelect(resource, e); }}
				onmouseenter={() => selectedIndex = globalIndex}
			>
				<span
					class="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
					style:background-color={tierColors[resource.tier] || '#3388ff'}
				></span>
				<span class="truncate">{resource.name}</span>
				<span class="ml-auto text-xs text-gray-600 shrink-0">T{resource.tier}</span>
			</button>
		{/each}
	{/if}

	{#if playerResults.length > 0}
		<div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
			Players
		</div>
		{#each playerResults as player, j}
			{@const globalIndex = locationResults.length + layerResults.length + creatureResults.length + resourceResults.length + j}
			<button
				class="w-full text-left px-3 py-2.5 sm:py-1.5 text-sm transition-colors flex items-center gap-2 {globalIndex === selectedIndex ? 'bg-blue-500/20 text-gray-200' : 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
				onmousedown={(e) => { if (e.shiftKey) e.preventDefault(); handleSelect(player, e); }}
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
