import type L from 'leaflet';

export function readableCoordinates(latlng: L.LatLng): [number, number] {
	return [Math.round(latlng.lat / 3), Math.round(latlng.lng / 3)];
}

export function formatCoordinates(latlng: L.LatLng): string {
	const [n, e] = readableCoordinates(latlng);
	return `N: ${n} E: ${e}`;
}
