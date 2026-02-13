import type { TrackingItem } from '$lib/types/geojson';

let items = $state<TrackingItem[]>([]);

export function getTrackingState() {
	return {
		get items() { return items; }
	};
}

export function addTrackingItem(item: TrackingItem): void {
	if (item.type === 'player' && item.entityId) {
		if (!items.some((i) => i.entityId === item.entityId)) {
			items = [...items, item];
		}
	} else {
		if (!items.some((i) => i.id === item.id)) {
			items = [...items, item];
		}
	}
}

export function toggleTrackingItem(id: number): void {
	items = items.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i));
}

export function toggleTrackingItemByEntityId(entityId: string): void {
	items = items.map((i) => (i.entityId === entityId ? { ...i, visible: !i.visible } : i));
}

export function clearTracking(): void {
	items = [];
}
