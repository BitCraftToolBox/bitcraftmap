<script lang="ts">
	import type { TrackingItem as TrackingItemType } from '$lib/types/geojson';

	let { item, onToggle }: { item: TrackingItemType; onToggle: () => void } = $props();
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
	<span class="text-gray-200">{item.text}</span>
</div>
