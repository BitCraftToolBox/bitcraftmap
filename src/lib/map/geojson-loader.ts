import L from 'leaflet';
import { createIcon } from './create-icon';
import { readableCoordinates } from './coordinate-utils';
import { validateGeoJson } from './geojson-validator';
import { paintGeoJson, type PaintContext } from './geojson-painter';
import { setSelection } from '$lib/stores/selection-store.svelte';
import { buildPopupHtml } from './popup-builder';

// Static icons - created once
let caveIcons: L.Icon[];
let claimIcons: L.Icon[];
let eventIcon: L.Icon;
let ruinedIcon: L.Icon;
let templeIcon: L.Icon;
let treeIcon: L.Icon;

export function initIcons(): void {
	caveIcons = Array.from({ length: 10 }, (_, i) => createIcon(`t${i + 1}`));
	claimIcons = Array.from({ length: 11 }, (_, i) => createIcon(`claimT${i}`));
	eventIcon = createIcon('jack-o-lantern');
	ruinedIcon = createIcon('ruinedCity');
	templeIcon = createIcon('temple');
	treeIcon = createIcon('travelerTree');
}

export async function loadTreesGeoJson(treesLayer: L.LayerGroup): Promise<void> {
	const file = await fetch('/markers/trees.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const selectionData = {
				type: 'wonder' as const,
				name: feature.properties.name,
				latlng: { lat: latlng.lat, lng: latlng.lng }
			};
			const marker = L.marker(latlng, { icon: treeIcon }).addTo(treesLayer);
			marker.bindPopup(buildPopupHtml(selectionData), { className: 'bcm-leaflet-popup' });
			marker.on('click', () => setSelection(selectionData));
			return marker;
		}
	});
}

export async function loadTemplesGeoJson(templesLayer: L.LayerGroup): Promise<void> {
	const file = await fetch('/markers/temples.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const selectionData = {
				type: 'temple' as const,
				name: feature.properties.name,
				latlng: { lat: latlng.lat, lng: latlng.lng }
			};
			const marker = L.marker(latlng, { icon: templeIcon }).addTo(templesLayer);
			marker.bindPopup(buildPopupHtml(selectionData), { className: 'bcm-leaflet-popup' });
			marker.on('click', () => setSelection(selectionData));
			return marker;
		}
	});
}

export async function loadRuinedGeoJson(ruinedLayer: L.LayerGroup): Promise<void> {
	const file = await fetch('/markers/ruined.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const coords = readableCoordinates(latlng);
			const selectionData = {
				type: 'ruined-city' as const,
				name: feature.properties.name,
				latlng: { lat: latlng.lat, lng: latlng.lng }
			};
			const marker = L.marker(latlng, {
				title: feature.properties.name + ' N ' + coords[0] + ' E ' + coords[1],
				icon: ruinedIcon
			}).addTo(ruinedLayer);
			(marker as any)._selectionData = selectionData;
			marker.bindPopup(buildPopupHtml(selectionData), { className: 'bcm-leaflet-popup' });
			marker.on('click', () => setSelection(selectionData));
			return marker;
		}
	});
}

export async function loadClaimsGeoJson(
	claimLayers: L.LayerGroup[],
	banksLayer: L.LayerGroup,
	marketsLayer: L.LayerGroup,
	waystonesLayer: L.LayerGroup
): Promise<void> {
	const file = await fetch('/markers/claims.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const coords = readableCoordinates(latlng);
			const selectionData = {
				type: 'claim' as const,
				name: feature.properties.name,
				entityId: feature.properties.entityId,
				tier: feature.properties.tier,
				latlng: { lat: latlng.lat, lng: latlng.lng },
				hasBank: !!feature.properties.has_bank,
				hasMarket: !!feature.properties.has_market,
				hasWaystone: !!feature.properties.has_waystone
			};
			const marker = L.marker(latlng, {
				title: feature.properties.name + ' N ' + coords[0] + ' E ' + coords[1],
				icon: claimIcons[feature.properties.tier]
			});
			(marker as any)._selectionData = selectionData;
			marker.bindPopup(buildPopupHtml(selectionData), { className: 'bcm-leaflet-popup' });
			marker.on('click', () => setSelection(selectionData));

			marker.addTo(claimLayers[feature.properties.tier]);

			if (feature.properties.has_bank) marker.addTo(banksLayer);
			if (feature.properties.has_market) marker.addTo(marketsLayer);
			if (feature.properties.has_waystone) marker.addTo(waystonesLayer);

			return marker;
		}
	});
}

export async function loadCavesGeoJson(caveLayers: L.LayerGroup[]): Promise<void> {
	const file = await fetch('/markers/caves.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const selectionData = {
				type: 'cave' as const,
				name: feature.properties.name,
				latlng: { lat: latlng.lat, lng: latlng.lng },
				tier: feature.properties.tier
			};
			const marker = L.marker(latlng, { icon: caveIcons[feature.properties.tier - 1] })
				.addTo(caveLayers[feature.properties.tier - 1]);
			marker.bindPopup(buildPopupHtml(selectionData), { className: 'bcm-leaflet-popup' });
			marker.on('click', () => setSelection(selectionData));
			return marker;
		}
	});
}

export async function loadEventsGeoJson(eventsLayer: L.LayerGroup, ctx: PaintContext): Promise<void> {
	const file = await fetch('/markers/events.geojson');
	const content = await file.text();
	const geoJson = validateGeoJson(content);
	paintGeoJson(geoJson, eventsLayer, ctx);
}

export async function loadDungeonsGeoJson(dungeonsLayer: L.LayerGroup, ctx: PaintContext): Promise<void> {
	const file = await fetch('/markers/dungeons.geojson');
	const content = await file.text();
	const geoJson = validateGeoJson(content);
	paintGeoJson(geoJson, dungeonsLayer, ctx);
}

export async function loadGridsGeoJson(gridsLayer: L.LayerGroup, ctx: PaintContext): Promise<void> {
	const file = await fetch('/markers/grids.geojson');
	const content = await file.text();
	const geoJson = validateGeoJson(content);
	paintGeoJson(geoJson, gridsLayer, ctx);
}

export function loadGeoJsonFromHash(waypointsLayer: L.LayerGroup, ctx: PaintContext, map: L.Map): void {
	const hashFromUrl = location.hash.slice(1);
	if (!hashFromUrl) return;
	const geoJson = validateGeoJson(hashFromUrl);
	paintGeoJson(geoJson, waypointsLayer, ctx);
	map.addLayer(waypointsLayer);
}
