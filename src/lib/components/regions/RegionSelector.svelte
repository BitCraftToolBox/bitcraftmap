<script lang="ts">
	import {
		getRegionState,
		toggleRegion,
		selectAllRegions
	} from '$lib/stores/region-store.svelte';

	let { onRegionsChange }: { onRegionsChange: () => void } = $props();

	const regions = getRegionState();

	// Numpad layout: bottom-left is region 1, top-right is region 9
	const NUMPAD_ORDER = [7, 8, 9, 4, 5, 6, 1, 2, 3];
</script>

<div>
	<button
		onclick={() => {
			selectAllRegions();
			onRegionsChange();
		}}
		class="w-full rounded px-2 py-2 sm:py-1 text-left text-xs transition-colors {regions.isAllSelected
			? 'bg-blue-500/10 text-blue-400'
			: 'text-gray-400 hover:bg-white/5 active:bg-white/5'}"
	>
		All Regions{regions.isAllSelected ? '' : ` (${regions.selected.size} selected)`}
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
