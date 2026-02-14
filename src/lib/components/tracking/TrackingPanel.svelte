<script lang="ts">
	import { getTrackingState, toggleTrackingItem, toggleTrackingItemByEntityId, removeTrackingItem, removeTrackingItemByEntityId } from '$lib/stores/tracking-store.svelte';
	import TrackingItem from './TrackingItem.svelte';

	let {
		onToggleResource,
		onTogglePlayer,
		onRemoveResource,
		onRemovePlayer
	}: {
		onToggleResource: (id: number) => void;
		onTogglePlayer: (entityId: string) => void;
		onRemoveResource: (id: number) => void;
		onRemovePlayer: (entityId: string) => void;
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
				onRemove={() => {
					if (item.type === 'player' && item.entityId) {
						removeTrackingItemByEntityId(item.entityId);
						onRemovePlayer(item.entityId);
					} else {
						removeTrackingItem(item.id);
						onRemoveResource(item.id);
					}
				}}
			/>
		{/each}
	</div>
{/if}
