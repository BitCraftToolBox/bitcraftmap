<script lang="ts">
	import {
		ALL_REGIONS,
		getRegionState,
		toggleRegion,
		selectAllRegions
	} from '$lib/stores/region-store.svelte';

	let { onRegionsChange }: { onRegionsChange: () => void } = $props();

	const regions = getRegionState();
	let expanded = $state(false);

	// Numpad layout: bottom-left is region 1, top-right is region 9
	const NUMPAD_ORDER = [7, 8, 9, 4, 5, 6, 1, 2, 3];
</script>

<div class="absolute top-16 sm:top-14 left-3 z-ui">
	<button
		onclick={() => (expanded = !expanded)}
		class="flex min-w-38 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#1e2433]/95 px-3 py-2.5 sm:py-1.5 text-sm text-gray-200 shadow-lg backdrop-blur-sm transition-colors hover:bg-[#2a3245] active:bg-[#2a3245]"
	>
		<svg class="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		Regions{regions.isAllSelected ? '' : ` (${regions.selected.size})`}
		<svg
			class="ml-auto h-3 w-3 text-gray-400 transition-transform duration-200 {expanded
				? 'rotate-180'
				: ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 9l-7 7-7-7"
			/>
		</svg>
	</button>

	{#if expanded}
		<div
			class="mt-1 rounded-lg border border-white/10 bg-[#1e2433]/95 p-2 shadow-xl backdrop-blur-sm"
		>
			<button
				onclick={() => {
					selectAllRegions();
					onRegionsChange();
				}}
				class="w-full rounded px-2 py-2 sm:py-1 text-left text-xs transition-colors {regions.isAllSelected
					? 'bg-blue-500/10 text-blue-400'
					: 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
			>
				All Regions
			</button>
			<div class="mt-1 grid grid-cols-3 gap-1.5 sm:gap-1">
				{#each NUMPAD_ORDER as id}
					<button
						onclick={() => {
							toggleRegion(id);
							onRegionsChange();
						}}
						class="h-10 sm:h-8 rounded text-xs font-medium transition-colors {regions.selected.has(
							id
						)
							? 'border border-blue-500/50 bg-blue-500/30 text-blue-300'
							: 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}"
					>
						{id}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
