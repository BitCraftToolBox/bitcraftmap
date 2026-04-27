<script lang="ts">
	import type L from 'leaflet';
	import LayerGroup from './LayerGroup.svelte';
	import { LAYER_GROUPS } from '$lib/types/layers';

	let {
		genericToggle,
		isActive,
		onToggle
	}: {
		genericToggle: Record<string, L.LayerGroup>;
		isActive: (name: string) => boolean;
		onToggle: (name: string) => void;
	} = $props();

	const groupedNames = new Set(
		Object.values(LAYER_GROUPS).flatMap((g) => [...g.layers, g.title])
	);

	const OVERLAY_LAYERS = new Set(['Roads']);

	function getUngroupedLayers(): string[] {
		return Object.keys(genericToggle).filter((name) => !groupedNames.has(name) && !OVERLAY_LAYERS.has(name));
	}
</script>

<div class="space-y-1">
	{#each Object.entries(LAYER_GROUPS) as [_key, group]}
		<LayerGroup
			title={group.title}
			layers={group.layers}
			defaultCollapsed={group.defaultCollapsed ?? false}
			{isActive}
			{onToggle}
		/>
	{/each}

	{#each getUngroupedLayers() as name}
		<label class="flex items-center gap-2 px-2 py-2 sm:py-1 rounded hover:bg-white/5 active:bg-white/5 cursor-pointer text-sm text-gray-300">
			<input
				type="checkbox"
				checked={isActive(name)}
				onchange={() => onToggle(name)}
				class="accent-blue-500"
			/>
			{name}
		</label>
	{/each}
</div>
