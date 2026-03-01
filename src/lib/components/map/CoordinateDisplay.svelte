<script lang="ts">
	import { Link, Check } from '@lucide/svelte';
	import { getMap } from '$lib/stores/map-store';
	import { readableCoordinates } from '$lib/map/coordinate-utils';
	import { buildViewUrl } from '$lib/utils/url-params';

	let { coords }: { coords: string } = $props();
	let copied = $state(false);

	function copyViewLink() {
		const map = getMap();
		if (!map) return;
		const center = map.getCenter();
		const [gameN, gameE] = readableCoordinates(center);
		const zoom = map.getZoom();
		const url = buildViewUrl(gameN, gameE, zoom);
		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1500);
		});
	}
</script>

<div
	class="flex items-center gap-1.5 min-w-52 sm:min-w-60 tabular-nums rounded bg-[#1e2433]/90 px-2 py-1 sm:px-3 sm:py-1.5 font-mono text-xs sm:text-sm text-gray-200 shadow-lg backdrop-blur-sm border border-white/10"
>
	<span class="flex-1">{coords}</span>
	<button
		onclick={copyViewLink}
		class="shrink-0 p-0.5 rounded hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
		aria-label="Copy link to current view"
		title={copied ? 'Copied!' : 'Copy link to view'}
	>
		{#if copied}
			<Check class="size-3.5 sm:size-4 text-green-400" />
		{:else}
			<Link class="size-3.5 sm:size-4 text-gray-400" />
		{/if}
	</button>
</div>
