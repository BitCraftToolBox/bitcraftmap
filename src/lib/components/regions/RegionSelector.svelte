<script lang="ts">
	import {
		getRegionState,
		toggleRegion,
		selectAllRegions,
		AVAILABLE_REGIONS
	} from '$lib/stores/region-store.svelte';

	let { onRegionsChange }: { onRegionsChange: () => void } = $props();

	const regions = getRegionState();

	// 5×5 grid displayed top-to-bottom (row 5 first, row 1 last)
	// Bottom-left is region 1, top-right is region 25
	const GRID_ORDER = [
		21, 22, 23, 24, 25,
		16, 17, 18, 19, 20,
		11, 12, 13, 14, 15,
		 6,  7,  8,  9, 10,
		 1,  2,  3,  4,  5
	];

	const availableSet = new Set(AVAILABLE_REGIONS);
</script>

<div>
	<button
		onclick={() => {
			selectAllRegions();
			onRegionsChange();
		}}
		class="w-full rounded px-2 py-2 sm:py-1 text-left text-xs
				transition-colors border border-white/5 {regions.isAllSelected
			? 'bg-blue-500/10 text-blue-400'
			: 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
	>
		All Regions{regions.isAllSelected ? '' : ` (${regions.selected.size} selected)`}
	</button>
	<div class="mt-1 grid grid-cols-5 gap-1.5 sm:gap-1">
		{#each GRID_ORDER as id}
			{@const available = availableSet.has(id)}
			<button
				onclick={() => {
					if (!available) return;
					toggleRegion(id);
					onRegionsChange();
				}}
				disabled={!available}
				class="h-10 sm:h-8 rounded text-xs font-medium transition-colors
					{!available
					? 'border border-white/5 bg-white/2 text-gray-600 cursor-not-allowed'
					: regions.selected.has(id)
						? 'border border-blue-500/50 bg-blue-500/30 text-blue-300'
						: 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}"
			>
				{id}
			</button>
		{/each}
	</div>
</div>
