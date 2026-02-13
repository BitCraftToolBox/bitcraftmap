import type L from 'leaflet';
import { searchPlayers } from '$lib/services/player-service';

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

export type SearchResult =
	| (SearchEntry & { type: 'location' })
	| PlayerEntry;

let entries = $state<SearchEntry[]>([]);
let query = $state('');
let selectedIndex = $state(-1);
let isOpen = $state(false);
let playerResults = $state<PlayerEntry[]>([]);
let isLoadingPlayers = $state(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function triggerPlayerSearch(q: string): void {
	if (debounceTimer) clearTimeout(debounceTimer);

	if (!q || q.trim().length < 2) {
		playerResults = [];
		isLoadingPlayers = false;
		return;
	}

	isLoadingPlayers = true;
	debounceTimer = setTimeout(async () => {
		const results = await searchPlayers(q);
		playerResults = results.map((p) => ({
			type: 'player' as const,
			entityId: p.entityId,
			username: p.username,
			signedIn: p.signedIn
		}));
		isLoadingPlayers = false;
	}, 300);
}

export function getSearchState() {
	return {
		get entries() { return entries; },
		get query() { return query; },
		set query(v: string) {
			query = v;
			selectedIndex = -1;
			triggerPlayerSearch(v);
		},
		get selectedIndex() { return selectedIndex; },
		set selectedIndex(v: number) { selectedIndex = v; },
		get isOpen() { return isOpen; },
		set isOpen(v: boolean) { isOpen = v; },
		get isLoadingPlayers() { return isLoadingPlayers; },

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

		get results(): SearchResult[] {
			return [...this.locationResults, ...this.playerResults];
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
	isLoadingPlayers = false;
	if (debounceTimer) clearTimeout(debounceTimer);
}
