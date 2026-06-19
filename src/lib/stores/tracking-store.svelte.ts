import type { TrackingItem } from '$lib/types/geojson';

const STORAGE_KEY = 'trackingColors';
const NAMES_KEY = 'trackingNames';
const FAVORITES_KEY = 'trackingFavorites';
let cachedStore: Record<string, string> | null = null;

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY) {
			cachedStore = null;
		}
		if (e.key === FAVORITES_KEY) {
			cachedFavorites = null;
			favoriteKeys = new Set(Object.keys(getFavoritesStore()));
			syncFavoritesOnItems();
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

type FavoriteType = 'resource' | 'enemy' | 'player';
type FavoriteEntry = { type: FavoriteType; id: number | string };

let cachedFavorites: Record<string, true> | null = null;
let favoriteKeys = $state<Set<string>>(new Set());

function getFavoritesStore(): Record<string, true> {
	if (cachedFavorites !== null) return cachedFavorites;
	try {
		const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}') as Record<string, unknown>;
		const normalized: Record<string, true> = {};
		for (const [key, value] of Object.entries(parsed)) {
			if (value === true) normalized[key] = true;
		}
		cachedFavorites = normalized;
		return normalized;
	} catch {
		cachedFavorites = {};
		return cachedFavorites;
	}
}

function persistFavorites(store: Record<string, true>): void {
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(store));
	} catch (e) {
		console.warn('Failed to save favorites:', e);
	}
	cachedFavorites = store;
	favoriteKeys = new Set(Object.keys(store));
	syncFavoritesOnItems();
}

function colorKey(type: 'resource' | 'enemy' | 'player' | undefined, id: number | string): string {
	if (type === 'player') return `player:${id}`;
	if (type === 'enemy') return `enemy:${id}`;
	return `resource:${id}`;
}

function favoriteKey(type: FavoriteType, id: number | string): string {
	return `${type}:${id}`;
}

function parseFavoriteKey(key: string): FavoriteEntry | null {
	const [type, ...idParts] = key.split(':');
	const id = idParts.join(':');
	if (!id || (type !== 'resource' && type !== 'enemy' && type !== 'player')) return null;
	if (type === 'player') return { type, id };
	const parsedId = Number(id);
	if (!Number.isFinite(parsedId)) return null;
	return { type, id: parsedId };
}

export function isFavorite(type: FavoriteType, id: number | string): boolean {
	return favoriteKeys.has(favoriteKey(type, id));
}

export function setFavorite(type: FavoriteType, id: number | string, favorite: boolean): void {
	const key = favoriteKey(type, id);
	const store = getFavoritesStore();
	if (favorite) store[key] = true;
	else delete store[key];
	persistFavorites(store);
}

export function removeFavorite(type: FavoriteType, id: number | string): void {
	setFavorite(type, id, false);
}

export function toggleFavorite(type: FavoriteType, id: number | string): boolean {
	const next = !isFavorite(type, id);
	setFavorite(type, id, next);
	return next;
}

export function getAllFavorites(): FavoriteEntry[] {
	const store = getFavoritesStore();
	return Object.keys(store)
		.map(parseFavoriteKey)
		.filter((entry): entry is FavoriteEntry => entry !== null);
}

export function loadFavorites(): FavoriteEntry[] {
	favoriteKeys = new Set(Object.keys(getFavoritesStore()));
	syncFavoritesOnItems();
	return getAllFavorites();
}

export function clearAllFavorites(): void {
	try {
		localStorage.removeItem(FAVORITES_KEY);
	} catch (e) {
		console.warn('Failed to clear favorites:', e);
	}
	cachedFavorites = null;
	favoriteKeys = new Set();
	syncFavoritesOnItems();
}

function syncFavoritesOnItems(): void {
	items = items.map((item) => ({
		...item,
		favorite: item.type ? isFavorite(item.type, item.entityId ?? item.id) : false,
	}));
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
	const normalized = {
		...item,
		favorite: item.type ? isFavorite(item.type, item.entityId ?? item.id) : false,
	};

	if (item.type === 'player' && item.entityId) {
		if (!items.some((i) => i.entityId === item.entityId)) {
			items = [...items, normalized];
			saveDisplayName(item.type, item.entityId, item.text);
		}
	} else {
		if (!items.some((i) => i.id === item.id && i.type === item.type)) {
			items = [...items, normalized];
			if (item.type) saveDisplayName(item.type, item.id, item.text);
		}
	}
}

export function updateTrackingItemFavorite(id: number, type: 'enemy' | 'resource', favorite: boolean): void {
	setFavorite(type, id, favorite);
	items = items.map((i) => (i.id === id && i.type === type ? { ...i, favorite } : i));
}

export function updateTrackingItemFavoriteByEntityId(entityId: string, favorite: boolean): void {
	setFavorite('player', entityId, favorite);
	items = items.map((i) => (i.entityId === entityId ? { ...i, favorite } : i));
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
