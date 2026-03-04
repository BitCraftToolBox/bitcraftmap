import type { TrackingItem } from '$lib/types/geojson';

const STORAGE_KEY = 'trackingColors';

function getColorStore(): Record<string, string> {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
	} catch {
		return {};
	}
}

function colorKey(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): string {
	if (type === 'player') return `player:${id}`;
	if (type === 'enemy') return `enemy:${id}`;
	return `resource:${id}`;
}

export function saveColorPreference(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string, color: string): void {
	const store = getColorStore();
	store[colorKey(type, id)] = color;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadColorPreference(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): string | undefined {
	return getColorStore()[colorKey(type, id)];
}

export function removeColorPreference(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): void {
	const store = getColorStore();
	delete store[colorKey(type, id)];
	localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAllColorPreferences(): Record<string, string> {
	return getColorStore();
}

export function clearAllColorPreferences(): void {
	localStorage.removeItem(STORAGE_KEY);
}

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

export function removeTrackingItem(id: number): void {
	items = items.filter((i) => i.id !== id);
}

export function removeTrackingItemByEntityId(entityId: string): void {
	items = items.filter((i) => i.entityId !== entityId);
}

export function updateTrackingItemColor(id: number, color: string): void {
	const item = items.find((i) => i.id === id);
	if (item) saveColorPreference(item.type, id, color);
	items = items.map((i) => (i.id === id ? { ...i, color } : i));
}

export function updateTrackingItemColorByEntityId(entityId: string, color: string): void {
	saveColorPreference('player', entityId, color);
	items = items.map((i) => (i.entityId === entityId ? { ...i, color } : i));
}

export function clearTracking(): void {
	items = [];
}
