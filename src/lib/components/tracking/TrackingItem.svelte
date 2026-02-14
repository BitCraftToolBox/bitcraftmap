<script lang="ts">
	import type { TrackingItem as TrackingItemType } from '$lib/types/geojson';

	let { item, onToggle, onRemove }: { item: TrackingItemType; onToggle: () => void; onRemove: () => void } = $props();
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
	<span
		class="inline-block w-2 h-2 rounded-full"
		style:background-color={item.color}
	></span>
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
