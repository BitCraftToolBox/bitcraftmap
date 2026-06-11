import type { TrackingItem } from '$lib/types/geojson';

const STORAGE_KEY = 'trackingColors';
const NAMES_KEY = 'trackingNames';
let cachedStore: Record<string, string> | null = null;

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY) {
			cachedStore = null;
		}
	});
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function isValidColor(color: string): boolean {
	return HEX_COLOR_RE.test(color);
}

function getColorStore(): Record<string, string> {
	if (cachedStore !== null) return cachedStore;
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
		cachedStore = parsed;
		return parsed;
	} catch {
		cachedStore = {};
		return cachedStore;
	}
}

function colorKey(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): string {
	if (type === 'player') return `player:${id}`;
	if (type === 'enemy') return `enemy:${id}`;
	return `resource:${id}`;
}

export function saveColorPreference(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string, color: string): void {
	if (!isValidColor(color)) return;
	const store = getColorStore();
	store[colorKey(type, id)] = color;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch (e) { console.warn('Failed to save color preference:', e); }
	cachedStore = store;
}

export function loadColorPreference(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): string | undefined {
	const color = getColorStore()[colorKey(type, id)];
	if (color !== undefined && !isValidColor(color)) return undefined;
	return color;
}

export function removeColorPreference(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): void {
	const store = getColorStore();
	delete store[colorKey(type, id)];
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch (e) { console.warn('Failed to remove color preference:', e); }
	cachedStore = store;
}

export function getAllColorPreferences(): Record<string, string> {
	const store = getColorStore();
	const filtered: Record<string, string> = {};
	for (const [key, color] of Object.entries(store)) {
		if (isValidColor(color)) filtered[key] = color;
	}
	return filtered;
}

export function clearAllColorPreferences(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(NAMES_KEY);
	} catch (e) { console.warn('Failed to clear color preferences:', e); }
	cachedStore = null;
}

function getNameStore(): Record<string, string> {
	try {
		return JSON.parse(localStorage.getItem(NAMES_KEY) || '{}');
	} catch {
		return {};
	}
}

export function saveDisplayName(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string, name: string): void {
	const store = getNameStore();
	store[colorKey(type, id)] = name;
	try {
		localStorage.setItem(NAMES_KEY, JSON.stringify(store));
	} catch { /* ignore */ }
}

export function loadDisplayName(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): string | undefined {
	return getNameStore()[colorKey(type, id)];
}

export function getAllDisplayNames(): Record<string, string> {
	return getNameStore();
}

type ColorSyncHandler = (type: 'resource' | 'enemy' | 'player', id: number | string, color: string) => void;
let colorSyncHandler: ColorSyncHandler | null = null;

export function registerColorSyncHandler(handler: ColorSyncHandler): () => void {
	colorSyncHandler = handler;
	return () => { colorSyncHandler = null; };
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
			saveDisplayName(item.type, item.entityId, item.text);
		}
	} else {
		if (!items.some((i) => i.id === item.id && i.type === item.type)) {
			items = [...items, item];
			if (item.type) saveDisplayName(item.type, item.id, item.text);
		}
	}
}

export function toggleTrackingItem(id: number, type: 'enemy' | 'resource'): void {
	items = items.map((i) => (i.id === id && i.type == type ? { ...i, visible: !i.visible } : i));
}

export function toggleTrackingItemByEntityId(entityId: string): void {
	items = items.map((i) => (i.entityId === entityId ? { ...i, visible: !i.visible } : i));
}

export function removeTrackingItem(id: number, type: 'enemy' | 'resource'): void {
	items = items.filter((i) => !(i.id === id && i.type === type));
}

export function removeTrackingItemByEntityId(entityId: string): void {
	items = items.filter((i) => i.entityId !== entityId);
}

export function updateTrackingItemColor(id: number, type: 'enemy' | 'resource', color: string): void {
	if (!isValidColor(color)) return;
	const item = items.find((i) => i.id === id && i.type === type);
	if (item) saveColorPreference(item.type, id, color);
	items = items.map((i) => (i.id === id && i.type === type ? { ...i, color } : i));
	if (item?.type) colorSyncHandler?.(item.type, id, color);
}

export function updateTrackingItemColorByEntityId(entityId: string, color: string): void {
	if (!isValidColor(color)) return;
	saveColorPreference('player', entityId, color);
	items = items.map((i) => (i.entityId === entityId ? { ...i, color } : i));
	colorSyncHandler?.('player', entityId, color);
}

export function clearTracking(): void {
	items = [];
}
