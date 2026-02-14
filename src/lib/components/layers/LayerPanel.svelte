<script lang="ts">
	import type L from 'leaflet';
	import { fly, fade } from 'svelte/transition';
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

	let collapsed = $state(true);

	// Ungrouped layers (like Roads) - items not in any group
	const groupedNames = new Set(
		Object.values(LAYER_GROUPS).flatMap((g) => [...g.layers, g.title])
	);

	function getUngroupedLayers(): string[] {
		return Object.keys(genericToggle).filter((name) => !groupedNames.has(name));
	}
</script>

<!-- Mobile: bottom sheet -->
<div class="sm:hidden">
	{#if !collapsed}
		<!-- Backdrop -->
		<button
			transition:fade={{ duration: 200 }}
			class="fixed inset-0 z-overlay bg-black/40"
			onclick={() => collapsed = true}
			aria-label="Close layer panel"
		></button>
	{/if}

	{#if collapsed}
		<!-- Collapsed: floating button at bottom-right -->
		<button
			onclick={() => collapsed = false}
			class="fixed bottom-16 right-3 z-overlay flex items-center justify-center w-11 h-11 rounded-lg bg-[#1e2433]/95 border border-white/10 shadow-xl backdrop-blur-sm text-gray-400 active:text-gray-200"
			aria-label="Open layers"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
			</svg>
		</button>
	{:else}
		<!-- Expanded: bottom sheet -->
		<div
			transition:fly={{ y: 300, duration: 250 }}
			class="fixed bottom-0 left-0 right-0 z-overlay max-h-[85dvh] overflow-y-auto rounded-t-xl bg-[#1e2433]/95 border-t border-white/10 shadow-xl backdrop-blur-sm"
		>
			<!-- Drag handle -->
			<div class="flex justify-center py-2">
				<div class="w-10 h-1 rounded-full bg-white/20"></div>
			</div>

			<div class="flex items-center justify-between px-4 pb-2">
				<h2 class="text-sm font-semibold text-gray-200 uppercase tracking-wider">Layers</h2>
				<button
					onclick={() => collapsed = true}
					class="p-2 text-gray-400 active:text-gray-200 transition-colors"
					aria-label="Close layer panel"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="px-3 pb-4 space-y-1">
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
					<label class="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/5 active:bg-white/5 cursor-pointer text-sm text-gray-300">
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
		</div>
	{/if}
</div>

<!-- Desktop: side panel (unchanged layout) -->
<div
	class="hidden sm:block absolute top-3 right-3 z-ui max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-lg bg-[#1e2433]/95 shadow-xl backdrop-blur-sm border border-white/10 transition-all duration-300"
	class:w-10={collapsed}
	class:w-64={!collapsed}
>
	{#if collapsed}
		<button
			onclick={() => collapsed = false}
			class="flex items-center justify-center w-full h-10 text-gray-400 hover:text-gray-200 active:text-gray-200 transition-colors"
			aria-label="Expand layer panel"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
	{:else}
		<div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
			<h2 class="text-xs font-semibold text-gray-200 uppercase tracking-wider">Layers</h2>
			<button
				onclick={() => collapsed = true}
				class="p-2 text-gray-400 hover:text-gray-200 active:text-gray-200 transition-colors"
				aria-label="Collapse layer panel"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<label class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 active:bg-white/5 cursor-pointer text-sm text-gray-300">
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
