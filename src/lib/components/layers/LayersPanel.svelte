<script lang="ts">
	import {onMount} from "svelte";
	import {OVERLAY_LAYERS} from "$lib/types/layers";

	let {
		isActive,
		onToggle,
		getBaseLayer,
		onSetBaseLayer
	}: {
		isActive: (name: string) => boolean;
		onToggle: (name: string) => void;
		getBaseLayer: () => 'terrain' | 'game';
		onSetBaseLayer: (layer: 'terrain' | 'game') => void;
	} = $props();

	const baseLayers: { value: 'terrain' | 'game'; label: string }[] = [
		{ value: 'terrain', label: 'Terrain' },
		{ value: 'game', label: 'Game' }
	];

	onMount(() => {
		document.querySelector(`input[name="baseLayer"][value="${getBaseLayer()}"]`)?.setAttribute('checked', 'checked');
	});
</script>

<div class="space-y-2">
	<div class="px-2">
		<h3 class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Base Map</h3>
		<div class="space-y-1">
		{#each baseLayers as opt (opt.value)}
			<label class="flex items-center gap-2 px-2 py-2 sm:py-1 rounded text-sm cursor-pointer transition-colors
				{getBaseLayer() === opt.value ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5'}">
				<input
					type="radio"
					name="baseLayer"
					value={opt.value}
					onclick={() => { onSetBaseLayer(opt.value); }}
					class="accent-blue-500"
				/>
				{opt.label}
			</label>
		{/each}
		</div>
	</div>

	<div class="px-2">
		<h3 class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Overlays</h3>
		<div class="space-y-1">
			{#each OVERLAY_LAYERS as opt (opt)}
				<label class="flex items-center gap-2 px-2 py-2 sm:py-1 rounded hover:bg-white/5 active:bg-white/5 cursor-pointer text-sm text-gray-300">
					<input
						type="checkbox"
						checked={isActive(opt)}
						onchange={() => onToggle(opt)}
						class="accent-blue-500"
					/>
					{opt}
				</label>
			{/each}
		</div>
	</div>
</div>
