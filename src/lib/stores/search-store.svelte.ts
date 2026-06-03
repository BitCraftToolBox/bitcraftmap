import type L from 'leaflet';
import type { MapSelection } from '$lib/types/map';
import { searchPlayers } from '$lib/services/player-service';
import {creatureIndex, resourceIndex} from '$lib/data/resource-index';

export interface SearchEntry {
	title: string;
	latlng: L.LatLng;
	layer: L.LayerGroup;
	marker: L.Marker;
	selectionData?: MapSelection;
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
	| PlayerEntry
	| ResourceEntry
	| CreatureSearchEntry;

let entries = $state<SearchEntry[]>([]);
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
				.filter((e) => e.title.toLowerCase().includes(lower))
				.slice(0, 50)
				.map((e) => ({ ...e, type: 'location' as const }));
		},

		get playerResults(): PlayerEntry[] {
			return playerResults;
		},

		get resourceResults(): ResourceEntry[] {
			if (!query.trim()) return [];
			const lower = query.toLowerCase();
			return Object.entries(resourceIndex)
				.filter(([, r]) => r.name.toLowerCase().includes(lower))
				.slice(0, 50)
				.map(([id, r]) => ({
					type: 'resource' as const,
					id: Number(id),
					name: r.name,
					tier: r.tier,
					tag: r.tag ?? "",
				}));
		},

		get creatureResults(): CreatureSearchEntry[] {
			if (!query.trim()) return [];
			const lower = query.toLowerCase();
			return Object.entries(creatureIndex)
				.filter(([, c]) => c.name.toLowerCase().includes(lower))
				.slice(0, 50)
				.map(([id, c]) => ({
					type: 'creature' as const,
					id: Number(id),
					name: c.name,
					tier: c.tier,
					tag: c.tag,
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

export function clearSearch(): void {
	query = '';
	selectedIndex = -1;
	isOpen = false;
	playerResults = [];
	isLoadingRemote = false;
	if (debounceTimer) clearTimeout(debounceTimer);
}
