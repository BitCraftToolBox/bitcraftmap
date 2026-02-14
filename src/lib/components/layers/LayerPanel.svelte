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

	let collapsed = $state(false);

	// Ungrouped layers (like Roads) - items not in any group
	const groupedNames = new Set(
		Object.values(LAYER_GROUPS).flatMap((g) => [...g.layers, g.title])
	);

	function getUngroupedLayers(): string[] {
		return Object.keys(genericToggle).filter((name) => !groupedNames.has(name));
	}
</script>

<div
	class="absolute top-3 right-3 z-[1000] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg bg-[#1e2433]/95 shadow-xl backdrop-blur-sm border border-white/10 transition-all duration-300"
	class:w-8={collapsed}
	class:w-64={!collapsed}
>
	{#if collapsed}
		<button
			onclick={() => collapsed = false}
			class="flex items-center justify-center w-full h-8 text-gray-400 hover:text-gray-200 transition-colors"
			aria-label="Expand layer panel"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
	{:else}
		<div class="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
			<h2 class="text-xs font-semibold text-gray-200 uppercase tracking-wider">Layers</h2>
			<button
				onclick={() => collapsed = true}
				class="p-0.5 text-gray-400 hover:text-gray-200 transition-colors"
				aria-label="Collapse layer panel"
			>
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	{/if}

	{#if !collapsed}
		<div class="p-2 space-y-1">
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
				<label class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-sm text-gray-300">
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
	{/if}
</div>
