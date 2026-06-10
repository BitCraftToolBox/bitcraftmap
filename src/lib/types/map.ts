import type L from 'leaflet';

export interface MapConfig {
	apothem: number;
	mapWidth: number;
	mapHeight: number;
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
	gistApi: string;
	exportsCdn: string;
	relayHost: string;
	relayModule: string;
}

// --- Map Selection Types ---

export type SelectionType = 'claim' | 'cave' | 'resource' | 'player' | 'wonder' | 'temple' | 'ruined-city' | 'watchtower' | 'hexite' | 'dungeon';

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
	isFollowing: boolean;
}

export interface GenericPOISelection {
	type: 'wonder' | 'temple' | 'ruined-city' | 'dungeon';
	name: string;
	latlng: SelectionLatLng;
}

export interface WatchtowerSelection {
	type: 'watchtower';
	towerEntityId: string;
	name: string;
	owner: string;
	ownerId?: string | null;
	latlng: SelectionLatLng;
	chunkCount?: number;
	fillColor?: string;
	outlineColor?: string;
}

export interface HexiteDepositSelection {
	type: 'hexite';
	name: string;
	latlng: SelectionLatLng;
	timer: string | undefined;
}

export type MapSelection =
	| ClaimSelection
	| CaveSelection
	| ResourceSelection
	| PlayerSelection
	| GenericPOISelection
	| WatchtowerSelection
	| HexiteDepositSelection;
