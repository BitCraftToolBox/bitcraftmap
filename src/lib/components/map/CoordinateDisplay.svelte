<script lang="ts">
	import CoordinateCopyButtons from '$lib/components/common/CoordinateCopyButtons.svelte';
	import { getMap } from '$lib/stores/map-store';
	import { readableCoordinates } from '$lib/map/coordinate-utils';
	import type { CoordinateView } from '$lib/utils/coordinate-links';

	let { coords }: { coords: string } = $props();

	function getCurrentViewCoordinates(): CoordinateView | null {
		const map = getMap();
		if (!map) return null;
		const center = map.getCenter();
		const [n, e] = readableCoordinates(center);
		return { n, e, z: map.getZoom() };
	}
</script>

<div
	class="flex items-center gap-1.5 min-w-52 sm:min-w-60 tabular-nums rounded bg-[#1e2433]/90 px-2 py-1 sm:px-3 sm:py-1.5 font-mono text-xs sm:text-sm text-gray-200 shadow-lg backdrop-blur-sm border border-white/10"
>
	<span class="flex-1">{coords}</span>
	<CoordinateCopyButtons getCoordinateView={getCurrentViewCoordinates} />
</div>
