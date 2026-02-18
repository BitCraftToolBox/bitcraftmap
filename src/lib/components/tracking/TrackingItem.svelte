<script lang="ts">
	import type { TrackingItem as TrackingItemType } from '$lib/types/geojson';

	let { item, onToggle, onRemove, onColorChange }: { item: TrackingItemType; onToggle: () => void; onRemove: () => void; onColorChange: (color: string) => void } = $props();

	let colorInput: HTMLInputElement;
</script>

<div
	class="flex items-center gap-2 rounded px-3 py-2.5 sm:py-1.5 font-mono text-xs shadow-lg border border-white/10 backdrop-blur-sm"
	style:background-color={item.color + '30'}
>
	<input
		type="checkbox"
		checked={item.visible}
		onchange={onToggle}
		class="accent-blue-500"
	/>
	<button
		type="button"
		class="inline-block w-3 h-3 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-white/50 transition-shadow shrink-0"
		style:background-color={item.color}
		onclick={() => colorInput.click()}
		aria-label="Change color"
	></button>
	<input
		bind:this={colorInput}
		type="color"
		value={item.color}
		class="sr-only"
		oninput={(e) => onColorChange(e.currentTarget.value)}
	/>
	<span class="text-gray-200 flex-1">{item.text}</span>
	<button
		onclick={onRemove}
		class="ml-auto cursor-pointer text-gray-500 transition-colors hover:text-red-400 active:text-red-400"
		aria-label="Remove tracking"
	>
		<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
</div>
