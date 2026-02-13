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
	<div class="absolute bottom-12 left-3 z-[1000] space-y-1">
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
