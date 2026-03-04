<script lang="ts">
	import { getTrackingState, toggleTrackingItem, toggleTrackingItemByEntityId, removeTrackingItem, removeTrackingItemByEntityId, updateTrackingItemColor, updateTrackingItemColorByEntityId } from '$lib/stores/tracking-store.svelte';
	import TrackingItem from './TrackingItem.svelte';

	let {
		onToggleResource,
		onTogglePlayer,
		onRemoveResource,
		onRemovePlayer,
	}: {
		onToggleResource: (id: number) => void;
		onTogglePlayer: (entityId: string) => void;
		onRemoveResource: (id: number) => void;
		onRemovePlayer: (entityId: string) => void;
	} = $props();

	const tracking = getTrackingState();
</script>

{#if tracking.items.length > 0}
	<div class="space-y-1">
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
				onColorChange={(color) => {
					if (item.type === 'player' && item.entityId) {
						updateTrackingItemColorByEntityId(item.entityId, color);
					} else {
						updateTrackingItemColor(item.id, color);
					}
				}}
			/>
		{/each}
	</div>
{:else}
	<p class="text-xs text-gray-500 px-2 py-3">No tracked resources or players. Use search to add items.</p>
{/if}
