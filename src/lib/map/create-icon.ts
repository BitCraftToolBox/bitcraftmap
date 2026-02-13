import L from 'leaflet';
import { iconsManifest } from '$lib/data/icons-manifest';

export function createIcon(iconName: string = 'Hex_Logo', iconSize: [number, number] = [32, 32]): L.Icon {
	const width = iconSize[0] ?? 32;
	const height = iconSize[1] ?? 32;
	return L.icon({
		iconUrl: iconsManifest[iconName],
		iconSize: [width, height],
		iconAnchor: [width / 2, height / 2],
		popupAnchor: [0, -height / 2],
		shadowUrl: undefined,
		shadowSize: undefined,
		shadowAnchor: undefined
	});
}

export function setupDefaultIcon(): void {
	// @ts-expect-error - Leaflet internal method override
	delete L.Icon.Default.prototype._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconUrl: iconsManifest['Hex_Logo'],
		iconRetinaUrl: iconsManifest['Hex_Logo'],
		iconSize: [32, 32],
		iconAnchor: [16, 16],
		popupAnchor: [0, -16],
		tooltipAnchor: [-16, 0],
		shadowUrl: null,
		shadowSize: null,
		shadowAnchor: null,
		shadowRetinaUrl: null
	});
}
