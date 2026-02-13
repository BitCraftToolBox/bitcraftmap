import type L from 'leaflet';
import { searchPlayers } from '$lib/services/player-service';
import { searchResources } from '$lib/services/resource-service';

export interface SearchEntry {
	title: string;
	latlng: L.LatLng;
	layer: L.LayerGroup;
	marker: L.Marker;
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

export type SearchResult =
	| (SearchEntry & { type: 'location' })
	| PlayerEntry
	| ResourceEntry;

let entries = $state<SearchEntry[]>([]);
let query = $state('');
let selectedIndex = $state(-1);
let isOpen = $state(false);
let playerResults = $state<PlayerEntry[]>([]);
let resourceResults = $state<ResourceEntry[]>([]);
let isLoadingRemote = $state(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function triggerRemoteSearch(q: string): void {
	if (debounceTimer) clearTimeout(debounceTimer);

	if (!q || q.trim().length < 2) {
		playerResults = [];
		resourceResults = [];
		isLoadingRemote = false;
		return;
	}

	isLoadingRemote = true;
	debounceTimer = setTimeout(async () => {
		const [players, resources] = await Promise.all([
			searchPlayers(q),
			searchResources(q)
		]);
		playerResults = players.map((p) => ({
			type: 'player' as const,
			entityId: p.entityId,
			username: p.username,
			signedIn: p.signedIn
		}));
		resourceResults = resources.map((r) => ({
			type: 'resource' as const,
			id: r.id,
			name: r.name,
			tier: r.tier,
			tag: r.tag
		}));
		isLoadingRemote = false;
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
			return resourceResults;
		},

		get results(): SearchResult[] {
			return [...this.locationResults, ...this.resourceResults, ...this.playerResults];
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
	resourceResults = [];
	isLoadingRemote = false;
	if (debounceTimer) clearTimeout(debounceTimer);
}
