import type L from 'leaflet';

export interface MapConfig {
	apothem: number;
	mapWidth: number;
	mapHeight: number;
	mapImageURL: string;
	preferCanvas: boolean;
	zoomAnimation: boolean;
	attributionControl: boolean;
	zoomControl: boolean;
	boxZoom: boolean;
	minZoom: number;
	maxZoom: number;
	zoomSnap: number;
	crs: L.CRS;
}

export interface AppConfig {
	backendUrl: string;
	gistApi: string;
	websocketUrl: string;
	exportsCdn: string;
}

// --- Map Selection Types ---

export type SelectionType = 'claim' | 'cave' | 'resource' | 'player' | 'wonder' | 'temple' | 'ruined-city';

export interface SelectionLatLng {
	lat: number;
	lng: number;
}

export interface ClaimSelection {
	type: 'claim';
	name: string;
	latlng: SelectionLatLng;
	entityId: string;
	tier: number;
	hasBank: boolean;
	hasMarket: boolean;
	hasWaystone: boolean;
}

export interface CaveSelection {
	type: 'cave';
	name: string;
	latlng: SelectionLatLng;
	tier: number;
}

export interface ResourceSelection {
	type: 'resource';
	name: string;
	latlng: SelectionLatLng;
	id: number;
	tier: number;
	color: string;
}

export interface PlayerSelection {
	type: 'player';
	name: string;
	latlng: SelectionLatLng;
	entityId: string;
	username: string;
	signedIn: boolean;
	color: string;
}

export interface GenericPOISelection {
	type: 'wonder' | 'temple' | 'ruined-city';
	name: string;
	latlng: SelectionLatLng;
}

export type MapSelection =
	| ClaimSelection
	| CaveSelection
	| ResourceSelection
	| PlayerSelection
	| GenericPOISelection;
