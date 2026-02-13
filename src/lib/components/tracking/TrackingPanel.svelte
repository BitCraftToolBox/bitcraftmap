<script lang="ts">
	import { getTrackingState, toggleTrackingItem } from '$lib/stores/tracking-store.svelte';
	import TrackingItem from './TrackingItem.svelte';

	let { onToggleResource }: { onToggleResource: (id: number) => void } = $props();

	const tracking = getTrackingState();
</script>

{#if tracking.items.length > 0}
	<div class="absolute bottom-12 left-3 z-[1000] space-y-1">
		{#each tracking.items as item (item.id)}
			<TrackingItem
				{item}
				onToggle={() => {
					toggleTrackingItem(item.id);
					if (item.id !== -1) onToggleResource(item.id);
				}}
			/>
		{/each}
	</div>
{/if}
