<script lang="ts">
	import { getTrackingState, toggleTrackingItem, toggleTrackingItemByEntityId, removeTrackingItem, removeTrackingItemByEntityId, updateTrackingItemColor, updateTrackingItemColorByEntityId, updateTrackingItemFavorite, updateTrackingItemFavoriteByEntityId } from '$lib/stores/tracking-store.svelte';
	import TrackingItem from './TrackingItem.svelte';

	let {
		onToggleResource,
		onTogglePlayer,
		onRemoveResource,
		onRemovePlayer,
		allPlayersEnabled,
		allPlayersColor,
		onToggleAllPlayers,
		onAllPlayersColorChange,
	}: {
		onToggleResource: (id: number, type: 'enemy' | 'resource') => void;
		onTogglePlayer: (entityId: string) => void;
		onRemoveResource: (id: number, type: 'enemy' | 'resource') => void;
		onRemovePlayer: (entityId: string) => void;
		allPlayersEnabled: boolean;
		allPlayersColor: string;
		onToggleAllPlayers: (enabled: boolean) => void;
		onAllPlayersColorChange: (color: string) => void;
	} = $props();

	const tracking = getTrackingState();

	let allPlayersColorInput: HTMLInputElement;
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
				onFavoriteToggle={() => {
					if (item.type === 'player' && item.entityId) {
						updateTrackingItemFavoriteByEntityId(item.entityId, !item.favorite);
					} else if (item.type === 'resource' || item.type === 'enemy') {
						updateTrackingItemFavorite(item.id, item.type, !item.favorite);
					}
				}}
			/>
		{/each}
	</div>
{:else}
	<p class="text-xs text-gray-500 px-2 py-3">No tracked resources or players. Use search to add items.</p>
{/if}

<div
	class="mt-1 flex items-center gap-2 rounded px-3 py-2.5 sm:py-1.5 font-mono text-xs shadow-lg border border-white/10 backdrop-blur-sm"
	style:background-color={allPlayersColor + '30'}
>
	<input
		type="checkbox"
		checked={allPlayersEnabled}
		onchange={(e) => onToggleAllPlayers(e.currentTarget.checked)}
		class="accent-blue-500"
	/>
	<button
		type="button"
		class="inline-block w-3 h-3 rounded-full cursor-pointer ring-1 ring-white/20 hover:ring-white/50 transition-shadow shrink-0"
		style:background-color={allPlayersColor}
		onclick={() => allPlayersColorInput.click()}
		aria-label="Change color"
	></button>
	<input
		bind:this={allPlayersColorInput}
		type="color"
		value={allPlayersColor}
		class="sr-only"
		oninput={(e) => onAllPlayersColorChange(e.currentTarget.value)}
	/>
	<span class="text-gray-200 flex-1">All online players</span>
</div>
