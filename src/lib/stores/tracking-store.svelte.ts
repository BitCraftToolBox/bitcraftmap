import type { TrackingItem } from '$lib/types/geojson';

let items = $state<TrackingItem[]>([]);

export function getTrackingState() {
	return {
		get items() { return items; }
	};
}

export function addTrackingItem(item: TrackingItem): void {
	if (!items.some((i) => i.id === item.id)) {
		items = [...items, item];
	}
}

export function toggleTrackingItem(id: number): void {
	items = items.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i));
}

export function clearTracking(): void {
	items = [];
}
