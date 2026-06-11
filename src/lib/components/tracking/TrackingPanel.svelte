<script lang="ts">
	import { getTrackingState, toggleTrackingItem, toggleTrackingItemByEntityId, removeTrackingItem, removeTrackingItemByEntityId, updateTrackingItemColor, updateTrackingItemColorByEntityId } from '$lib/stores/tracking-store.svelte';
	import TrackingItem from './TrackingItem.svelte';

	let {
		onToggleResource,
		onTogglePlayer,
		onRemoveResource,
		onRemovePlayer,
	}: {
		onToggleResource: (id: number, type: 'enemy' | 'resource') => void;
		onTogglePlayer: (entityId: string) => void;
		onRemoveResource: (id: number, type: 'enemy' | 'resource') => void;
		onRemovePlayer: (entityId: string) => void;
	} = $props();

	const tracking = getTrackingState();
</script>

{#if tracking.items.length > 0}
	<div class="space-y-1">
		{#each tracking.items as item (item.entityId ?? (item.type + ":" + item.id))}
			<TrackingItem
				{item}
				onToggle={() => {
					if (item.type === 'player' && item.entityId) {
						toggleTrackingItemByEntityId(item.entityId);
						onTogglePlayer(item.entityId);
					} else if (item.type === 'resource' || item.type === 'enemy') {
						toggleTrackingItem(item.id, item.type);
						if (item.id !== -1) onToggleResource(item.id, item.type);
					}
				}}
				onRemove={() => {
					if (item.type === 'player' && item.entityId) {
						removeTrackingItemByEntityId(item.entityId);
						onRemovePlayer(item.entityId);
					} else if (item.type === 'resource' || item.type === 'enemy') {
						removeTrackingItem(item.id, item.type);
						onRemoveResource(item.id, item.type);
					}
				}}
				onColorChange={(color) => {
					if (item.type === 'player' && item.entityId) {
						updateTrackingItemColorByEntityId(item.entityId, color);
					} else if (item.type === 'resource' || item.type === 'enemy') {
						updateTrackingItemColor(item.id, item.type, color);
					}
				}}
			/>
		{/each}
	</div>
{:else}
	<p class="text-xs text-gray-500 px-2 py-3">No tracked resources or players. Use search to add items.</p>
{/if}
