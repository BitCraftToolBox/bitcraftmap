<script lang="ts">
	import { getTrackingState, toggleTrackingItem, toggleTrackingItemByEntityId } from '$lib/stores/tracking-store.svelte';
	import TrackingItem from './TrackingItem.svelte';

	let {
		onToggleResource,
		onTogglePlayer
	}: {
		onToggleResource: (id: number) => void;
		onTogglePlayer: (entityId: string) => void;
	} = $props();

	const tracking = getTrackingState();
</script>

{#if tracking.items.length > 0}
	<div class="absolute bottom-14 left-3 right-3 sm:right-auto z-ui space-y-1 max-h-[30dvh] overflow-y-auto">
		{#each tracking.items as item (item.entityId ?? item.id)}
			<TrackingItem
				{item}
				onToggle={() => {
					if (item.type === 'player' && item.entityId) {
						toggleTrackingItemByEntityId(item.entityId);
						onTogglePlayer(item.entityId);
					} else {
						toggleTrackingItem(item.id);
						if (item.id !== -1) onToggleResource(item.id);
					}
				}}
			/>
		{/each}
	</div>
{/if}
