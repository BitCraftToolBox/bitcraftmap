import type L from 'leaflet';

export interface SearchEntry {
	title: string;
	latlng: L.LatLng;
	layer: L.LayerGroup;
	marker: L.Marker;
}

let entries = $state<SearchEntry[]>([]);
let query = $state('');
let selectedIndex = $state(-1);
let isOpen = $state(false);

export function getSearchState() {
	return {
		get entries() { return entries; },
		get query() { return query; },
		set query(v: string) { query = v; selectedIndex = -1; },
		get selectedIndex() { return selectedIndex; },
		set selectedIndex(v: number) { selectedIndex = v; },
		get isOpen() { return isOpen; },
		set isOpen(v: boolean) { isOpen = v; },
		get results() {
			if (!query.trim()) return [];
			const lower = query.toLowerCase();
			return entries.filter((e) => e.title.toLowerCase().includes(lower)).slice(0, 50);
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
}
