<script lang="ts">
	import { Palette, RotateCcw, X } from '@lucide/svelte';
	import { getAllColorPreferences, saveColorPreference, removeColorPreference, clearAllColorPreferences, clearTracking } from '$lib/stores/tracking-store.svelte';
	import { selectAllRegions } from '$lib/stores/region-store.svelte';
	import { resetView } from '$lib/stores/map-store';
	import { resourceIndex, resourceIndexOverride, creatureIndex } from '$lib/data/resource-index';

	let colorEntries = $state(loadEntries());

	function loadEntries() {
		const store = getAllColorPreferences();
		return Object.entries(store).map(([key, color]) => {
			const [type, id] = key.split(':') as ['resource' | 'enemy' | 'player', string];
			let name: string;
			if (type === 'enemy') {
				name = creatureIndex[id]?.name || `Enemy ${id}`;
			} else if (type === 'resource') {
				name = resourceIndexOverride[id]?.name || resourceIndex[id]?.name || `Resource ${id}`;
			} else {
				name = `Player ${id}`;
			}
			return { key, type, id, name, color };
		});
	}

	function refresh() {
		colorEntries = loadEntries();
	}

	function handleColorChange(type: 'resource' | 'enemy' | 'player', id: string, color: string) {
		saveColorPreference(type, id, color);
		refresh();
	}

	function handleRemove(type: 'resource' | 'enemy' | 'player', id: string) {
		removeColorPreference(type, id);
		refresh();
	}

	function handleClearColors() {
		clearAllColorPreferences();
		refresh();
	}

	function handleResetEverything() {
		clearAllColorPreferences();
		clearTracking();
		selectAllRegions();
		resetView();
		localStorage.setItem('activeLayers', JSON.stringify(["Events", "Wonders", "Temples", "Ruined Cities"]));
		location.reload();
	}

	let colorInputs: Record<string, HTMLInputElement> = {};
	let confirmingReset = $state(false);
</script>

<div class="space-y-5">
	<!-- Saved Colors -->
	<section>
		<div class="flex items-center gap-2 px-1 mb-2.5">
			<Palette size={14} class="text-gray-400" />
			<h3 class="text-[11px] font-semibold text-gray-300 uppercase tracking-wider flex-1">Saved Colors</h3>
			{#if colorEntries.length > 0}
				<button
					type="button"
					onclick={handleClearColors}
					class="text-[10px] text-gray-500 hover:text-red-400 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
				>
					Clear all
				</button>
			{/if}
		</div>

		{#if colorEntries.length > 0}
			<div class="space-y-1">
				{#each colorEntries as entry (entry.key)}
					<div
						class="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs border border-white/5 hover:border-white/10 transition-colors"
						style:background-color={entry.color + '18'}
					>
						<button
							type="button"
							class="w-4 h-4 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-white/50 hover:scale-110 transition-all shrink-0 shadow-sm"
							style:background-color={entry.color}
							onclick={() => colorInputs[entry.key]?.click()}
							aria-label="Change color"
						></button>
						<input
							bind:this={colorInputs[entry.key]}
							type="color"
							value={entry.color}
							class="sr-only"
							oninput={(e) => handleColorChange(entry.type, entry.id, e.currentTarget.value)}
						/>
						<div class="flex-1 min-w-0">
							<span class="text-gray-200 block truncate">{entry.name}</span>
						</div>
						<span class="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{entry.type}</span>
						<button
							onclick={() => handleRemove(entry.type, entry.id)}
							class="cursor-pointer text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
							aria-label="Remove color"
						>
							<X size={14} />
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center py-4 text-gray-500">
				<Palette size={20} class="mb-1.5 opacity-40" />
				<p class="text-xs">No saved colors</p>
			</div>
		{/if}
	</section>

	<!-- Divider -->
	<div class="border-t border-white/5"></div>

	<!-- Reset Everything -->
	<div class="px-1 pb-1">
		{#if !confirmingReset}
			<button
				type="button"
				onclick={() => confirmingReset = true}
				class="w-full flex items-center justify-center gap-2 text-xs rounded-lg px-3 py-2.5 text-red-400/70 hover:text-red-400 border border-red-400/10 hover:border-red-400/25 hover:bg-red-400/5 transition-colors cursor-pointer"
			>
				<RotateCcw size={13} />
				Reset everything to defaults
			</button>
		{:else}
			<div class="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2.5 space-y-2">
				<p class="text-[11px] text-red-300/80 text-center">This will clear all saved colors, tracking, regions, layers and map position.</p>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => confirmingReset = false}
						class="flex-1 text-xs rounded-md px-3 py-1.5 text-gray-400 hover:text-gray-200 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleResetEverything}
						class="flex-1 text-xs rounded-md px-3 py-1.5 text-red-400 border border-red-400/25 hover:bg-red-400/10 transition-colors cursor-pointer"
					>
						Confirm
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
