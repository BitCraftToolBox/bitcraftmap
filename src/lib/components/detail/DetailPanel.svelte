<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { XIcon } from '@lucide/svelte';
	import { getSelectionState, clearSelection } from '$lib/stores/selection-store.svelte';
	import { readableCoordinates } from '$lib/map/coordinate-utils';
	import L from 'leaflet';

	let {
		onTrackResource,
		onFollowPlayer
	}: {
		onTrackResource?: (id: number, name: string, tier: number) => void;
		onFollowPlayer?: (entityId: string, username: string) => void;
	} = $props();

	const selection = getSelectionState();

	type SheetState = 'peeking' | 'expanded';
	let mobileState = $state<SheetState>('peeking');

	// Reset to peeking when selection changes
	$effect(() => {
		if (selection.current) {
			mobileState = 'peeking';
		}
	});

	function dismiss(): void {
		clearSelection();
	}

	function getCoordString(latlng: { lat: number; lng: number }): string {
		const coords = readableCoordinates(L.latLng(latlng.lat, latlng.lng));
		return `N: ${coords[0]} E: ${coords[1]}`;
	}

	function typeLabel(type: string): string {
		switch (type) {
			case 'claim': return 'Claim';
			case 'cave': return 'Cave';
			case 'resource': return 'Resource';
			case 'player': return 'Player';
			case 'wonder': return 'Wonder';
			case 'temple': return 'Temple';
			case 'ruined-city': return 'Ruined City';
			case 'watchtower': return 'Watchtower';
			case 'hexite': return 'Hexite Deposit';
			case 'dungeon': return 'Dungeon';
			default: return 'Location';
		}
	}
</script>

<!-- Mobile-only bottom sheet (desktop uses Leaflet popups) -->
{#if selection.isOpen && selection.current}
	{@const item = selection.current}

	<div class="sm:hidden">
		{#if mobileState === 'expanded'}
			<button
				transition:fade={{ duration: 200 }}
				class="fixed inset-0 z-detail bg-black/40"
				onclick={() => (mobileState = 'peeking')}
				aria-label="Collapse detail"
			></button>
		{/if}

		<div
			transition:fly={{ y: 200, duration: 250 }}
			class="fixed left-0 right-0 z-overlay rounded-t-xl bg-[#1e2433]/95 border-t border-white/10 shadow-xl backdrop-blur-sm transition-[max-height] duration-300 overflow-hidden"
			style:bottom="48px"
			style:max-height={mobileState === 'expanded' ? '70dvh' : '4rem'}
		>
			<!-- Drag handle (tap to toggle) -->
			<button
				class="flex justify-center w-full py-2"
				onclick={() => (mobileState = mobileState === 'peeking' ? 'expanded' : 'peeking')}
				aria-label={mobileState === 'peeking' ? 'Expand details' : 'Collapse details'}
			>
				<div class="w-10 h-1 rounded-full bg-white/20"></div>
			</button>

			{#if mobileState === 'peeking'}
				<!-- One-line summary -->
				<div class="px-4 pb-2 flex items-center justify-between">
					<div class="flex items-center gap-2 min-w-0 flex-1">
						<span class="text-xs text-gray-500">{typeLabel(item.type)}</span>
						<span class="text-sm text-gray-200 truncate">{item.name}</span>
					</div>
					<button
						onclick={dismiss}
						class="p-1 text-gray-400 active:text-gray-200 shrink-0"
						aria-label="Dismiss"
					>
						<XIcon size={14} />
					</button>
				</div>
			{:else}
				<!-- Full details -->
				<div class="px-4 pb-4 overflow-y-auto" style:max-height="calc(70dvh - 2.5rem)">
					<div class="flex items-center justify-between mb-3">
						<div class="min-w-0 flex-1">
							<h2 class="text-sm font-semibold text-gray-200 truncate">{item.name}</h2>
							<span class="text-xs text-gray-500">{typeLabel(item.type)}</span>
						</div>
						<button
							onclick={dismiss}
							class="p-1 text-gray-400 active:text-gray-200 shrink-0 ml-2"
							aria-label="Dismiss"
						>
							<XIcon size={16} />
						</button>
					</div>

					<div class="space-y-3">
						{#if item.type === 'claim'}
							<div class="flex items-center gap-2">
								<span class="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">T{item.tier}</span>
							</div>
							<div class="text-xs text-gray-400">{getCoordString(item.latlng)}</div>
							<div class="space-y-1.5 text-sm text-gray-300">
								<div class="flex justify-between"><span>Bank</span><span class="text-gray-400">{item.hasBank ? 'Yes' : 'No'}</span></div>
								<div class="flex justify-between"><span>Market</span><span class="text-gray-400">{item.hasMarket ? 'Yes' : 'No'}</span></div>
								<div class="flex justify-between"><span>Waystone</span><span class="text-gray-400">{item.hasWaystone ? 'Yes' : 'No'}</span></div>
							</div>
							<a
								href="https://bitjita.com/claims/{item.entityId}"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-block text-xs text-blue-400 hover:underline mt-1"
							>
								View on bitjita.com
							</a>

						{:else if item.type === 'cave'}
							<div class="flex items-center gap-2">
								<span class="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">T{item.tier}</span>
							</div>
							<div class="text-xs text-gray-400">{getCoordString(item.latlng)}</div>

						{:else if item.type === 'resource'}
							<div class="flex items-center gap-2">
								<span class="w-3 h-3 rounded-sm shrink-0" style:background-color={item.color}></span>
								<span class="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">T{item.tier}</span>
							</div>
							<div class="text-xs text-gray-400">{getCoordString(item.latlng)}</div>
							<button
								onclick={() => onTrackResource?.(item.id, item.name, item.tier)}
								class="w-full mt-2 px-3 py-2.5 rounded bg-blue-500/20 text-blue-400 text-sm active:bg-blue-500/30 transition-colors"
							>
								Track Resource
							</button>

						{:else if item.type === 'player'}
							<div class="flex items-center gap-2">
								<span
									class="w-2 h-2 rounded-full shrink-0"
									style:background-color={item.signedIn ? '#22c55e' : '#6b7280'}
								></span>
								<span class="text-xs text-gray-400">{item.signedIn ? 'Online' : 'Offline'}</span>
							</div>
							<div class="text-xs text-gray-400">{getCoordString(item.latlng)}</div>
							<button
								onclick={() => onFollowPlayer?.(item.entityId, item.username)}
								class="w-full mt-2 px-3 py-2.5 rounded bg-emerald-500/20 text-emerald-400 text-sm active:bg-emerald-500/30 transition-colors"
							>
								Follow Player
							</button>

						{:else if item.type === 'watchtower'}
							<div class="flex items-center gap-2">
								<span class="w-3 h-3 rounded-sm shrink-0" style:background-color={item.fillColor ?? '#3388ff'}></span>
								{#if item.chunkCount}
									<span class="text-xs text-gray-400">{item.chunkCount} chunks</span>
								{/if}
							</div>
							<div class="text-xs text-gray-400">{getCoordString(item.latlng)}</div>

						{:else}
							<div class="text-xs text-gray-400">{getCoordString(item.latlng)}</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
