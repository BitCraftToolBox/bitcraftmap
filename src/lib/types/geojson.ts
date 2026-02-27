export interface BitcraftFeatureProperties {
	name?: string;
	entityId?: string;
	tier?: number;
	has_bank?: boolean;
	has_market?: boolean;
	has_waystone?: boolean;

	// GeoJSON waypoint properties
	popupText?: string | string[];
	iconName?: string;
	iconSize?: [number, number];
	makeCanvas?: boolean;
	radius?: number;
	type?: 'tooltip' | string;

	// Tower territory properties
	pointCoords?: [number, number];
	chunkCount?: number;

	// Navigation properties
	flyTo?: [number, number];
	zoomTo?: number;
	noPan?: boolean;

	// Layer control properties
	turnLayerOn?: string | string[];
	turnLayerOff?: string | string[];

	// Style properties
	color?: string;
	fillColor?: string;
	weight?: number;
	opacity?: number;
	fillOpacity?: number;
}

export interface TrackingItem {
	id: number;
	entityId?: string;
	type?: 'resource' | 'player';
	text: string;
	color: string;
	visible: boolean;
}

export interface PlayerSearchResult {
	entityId: string;
	username: string;
	signedIn: boolean;
	timePlayed: number;
	timeSignedIn: number;
	createdAt: string;
	updatedAt: string;
	lastLoginTimestamp: string | null;
}

export interface PlayerSearchResponse {
	players: PlayerSearchResult[];
	total: number;
}

export interface ResourceSearchResult {
	id: number;
	name: string;
	tier: number;
	tag: string;
	rarity: number;
}

export interface ResourceSearchResponse {
	resources: ResourceSearchResult[];
	count: number;
}

export interface UrlParams {
	heatmap: boolean;
	gistId: string | null;
	regionId: string;
	resourceId: string;
	enemyId: string;
	noColors: boolean;
	playerId: string;
	followPlayer: boolean;
	hash: string;
}
