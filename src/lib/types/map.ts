import type L from 'leaflet';

export interface MapConfig {
	apothem: number;
	mapWidth: number;
	mapHeight: number;
	mapImageURL: string;
	mapImageHiResURL: string;
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
