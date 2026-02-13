import type L from 'leaflet';

let mapInstance: L.Map | null = null;
let defaultCenter: L.LatLng | null = null;
let defaultZoom: number = 0;

export function setMap(map: L.Map): void {
	mapInstance = map;
	defaultCenter = map.getCenter();
	defaultZoom = map.getZoom();
}

export function getMap(): L.Map | null {
	return mapInstance;
}

export function resetView(): void {
	if (!mapInstance || !defaultCenter) return;
	mapInstance.setView(defaultCenter, defaultZoom);
	localStorage.setItem('mapCenter', JSON.stringify(defaultCenter));
	localStorage.setItem('mapZoom', String(defaultZoom));
}

export function saveMapState(map: L.Map): void {
	const center = map.getCenter();
	localStorage.setItem('mapCenter', JSON.stringify([center.lat, center.lng]));
	localStorage.setItem('mapZoom', String(map.getZoom()));
}

export function restoreMapState(map: L.Map): boolean {
	const savedCenter = localStorage.getItem('mapCenter');
	const savedZoom = localStorage.getItem('mapZoom');
	if (savedCenter && savedZoom) {
		const centerCoords = JSON.parse(savedCenter);
		const zoomLevel = parseFloat(savedZoom);
		map.setView(centerCoords, zoomLevel);
		return true;
	}
	return false;
}

export function hashHasFlyToOrZoom(): boolean {
	const hashFromUrl = location.hash.slice(1);
	if (!hashFromUrl) return false;
	try {
		const geoJson = JSON.parse(decodeURIComponent(hashFromUrl));
		return geoJson?.features?.some(
			(f: { properties?: { flyTo?: unknown; zoomTo?: unknown } }) =>
				(f.properties?.flyTo && f.properties?.zoomTo != null) || f.properties?.zoomTo != null
		);
	} catch {
		return false;
	}
}
