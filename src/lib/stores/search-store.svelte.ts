import {creatureIndex, resourceIndex} from '$lib/data/resource-index';
import {searchPlayers} from '$lib/services/player-service';
import type {MapSelection} from '$lib/types/map';
import type L from 'leaflet';

interface TierTagSearchItem {
	name: string;
	tier: number;
	tag?: string | null;
}

interface ParsedTierTagQuery {
	tiers: Set<number>;
	terms: string[];
}

function parseTierTagQuery(searchTerm: string): ParsedTierTagQuery | null {
	const trimmed = searchTerm.trim().toLowerCase();
	if (!trimmed) return null;

	const tierMatches = [...trimmed.matchAll(/\bt(\d{1,2})\b/g)];
	const tiers = new Set(tierMatches.map((match) => Number(match[1])));
	const terms = trimmed
		.replace(/\bt\d{1,2}\b/g, ' ')
		.split(/\s+/)
		.filter(Boolean);

	return {tiers, terms};
}

function matchesTierTagQuery(item: TierTagSearchItem, query: ParsedTierTagQuery): boolean {
	if (query.tiers.size > 0 && !query.tiers.has(item.tier)) {
		return false;
	}

	if (query.terms.length === 0) {
		return true;
	}

	const name = item.name.toLowerCase();
	const tag = (item.tag ?? '').toLowerCase();
	return query.terms.every((term) => name.includes(term) || tag.includes(term));
}

function searchByNameTierAndTag<TItem extends TierTagSearchItem, TResult>(
	searchTerm: string,
	items: Record<string, TItem>,
	mapResult: (id: number, item: TItem) => TResult,
	limit = 50
): TResult[] {
	const parsedQuery = parseTierTagQuery(searchTerm);
	if (!parsedQuery) return [];

	const results: TResult[] = [];
	for (const [id, item] of Object.entries(items)) {
		if (!matchesTierTagQuery(item, parsedQuery)) {
			continue;
		}

		results.push(mapResult(Number(id), item));
		if (results.length >= limit) {
			break;
		}
	}

	return results;
}

export interface SearchEntry {
	title: string;
	latlng: L.LatLng;
	layer: L.LayerGroup;
	marker: L.Marker;
	selectionData?: MapSelection;
}

export interface LayerEntry {
	type: 'layer';
	title: string;
	layer: L.LayerGroup;
}

export interface PlayerEntry {
	type: 'player';
	entityId: string;
	username: string;
	signedIn: boolean;
}

export interface ResourceEntry {
	type: 'resource';
	id: number;
	name: string;
	tier: number;
	tag: string;
}

export interface CreatureSearchEntry {
	type: 'creature';
	id: number;
	name: string;
	tier: number;
	tag: string;
}

export type SearchResult =
	| (SearchEntry & { type: 'location' })
	| LayerEntry
	| PlayerEntry
	| ResourceEntry
	| CreatureSearchEntry;

let entries = $state<SearchEntry[]>([]);
let layersByName = $state<LayerEntry[]>([]);
let query = $state('');
let selectedIndex = $state(-1);
let isOpen = $state(false);
let playerResults = $state<PlayerEntry[]>([]);
let isLoadingRemote = $state(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function triggerRemoteSearch(q: string): void {
	if (debounceTimer) clearTimeout(debounceTimer);

	if (!q || q.trim().length < 2) {
		playerResults = [];
		isLoadingRemote = false;
		return;
	}

	isLoadingRemote = true;
	debounceTimer = setTimeout(async () => {
		try {
			const playerPromise = searchPlayers(q).then(players => {
				playerResults = players.map((p) => ({
					type: 'player' as const,
					entityId: p.entityId,
					username: p.username,
					signedIn: p.signedIn
				}));
			});
			await Promise.allSettled([playerPromise]);
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoadingRemote = false;
		}
	}, 300);
}

export function getSearchState() {
	return {
		get entries() { return entries; },
		get query() { return query; },
		set query(v: string) {
			query = v;
			selectedIndex = -1;
			triggerRemoteSearch(v);
		},
		get selectedIndex() { return selectedIndex; },
		set selectedIndex(v: number) { selectedIndex = v; },
		get isOpen() { return isOpen; },
		set isOpen(v: boolean) { isOpen = v; },
		get isLoadingRemote() { return isLoadingRemote; },

		get locationResults(): (SearchEntry & { type: 'location' })[] {
			if (!query.trim()) return [];
			const lower = query.toLowerCase();
			return entries
				.filter((e) => e.marker !== null && e.title.toLowerCase().includes(lower))
				.slice(0, 50)
				.map((e) => ({...e, type: 'location' as const}));
		},

		get layerResults(): LayerEntry[] {
			if (!query.trim()) return [];
			const lower = query.toLowerCase();
			return layersByName
				.filter((l) => l.title.toLowerCase().includes(lower))
				.slice(0, 50);
		},

		get playerResults(): PlayerEntry[] {
			return playerResults;
		},

		get resourceResults(): ResourceEntry[] {
			return searchByNameTierAndTag(query, resourceIndex, (id, r) => ({
				type: 'resource' as const,
				id,
				name: r.name,
				tier: r.tier,
				tag: r.tag ?? '',
			}));
		},

		get creatureResults(): CreatureSearchEntry[] {
			return searchByNameTierAndTag(query, creatureIndex, (id, c) => ({
				type: 'creature' as const,
				id,
				name: c.name,
				tier: c.tier,
				tag: c.tag ?? '',
			}));
		},

		get results(): SearchResult[] {
			return [...this.locationResults, ...this.creatureResults, ...this.resourceResults, ...this.playerResults];
		}
	};
}

export function addSearchEntries(newEntries: SearchEntry[]): void {
	entries = [...entries, ...newEntries];
}

export function addLayerEntries(newLayers: LayerEntry[]): void {
	layersByName = [...layersByName, ...newLayers];
}

export function clearSearch(): void {
	query = '';
	selectedIndex = -1;
	isOpen = false;
	playerResults = [];
	isLoadingRemote = false;
	if (debounceTimer) clearTimeout(debounceTimer);
}
