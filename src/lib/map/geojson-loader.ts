import L from 'leaflet';
import { createIcon } from './create-icon';
import { readableCoordinates } from './coordinate-utils';
import { validateGeoJson } from './geojson-validator';
import { paintGeoJson, type PaintContext } from './geojson-painter';

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
			const coords = readableCoordinates(latlng);
			const name = feature.properties.name + '<br>';
			const loc = 'N ' + coords[0] + ' E ' + coords[1];
			return L.marker(latlng, { icon: treeIcon }).bindPopup(name + loc).addTo(treesLayer);
		}
	});
}

export async function loadTemplesGeoJson(templesLayer: L.LayerGroup): Promise<void> {
	const file = await fetch('/markers/temples.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const coords = readableCoordinates(latlng);
			const name = feature.properties.name + '<br>';
			const loc = 'N ' + coords[0] + ' E ' + coords[1];
			return L.marker(latlng, { icon: templeIcon }).bindPopup(name + loc).addTo(templesLayer);
		}
	});
}

export async function loadRuinedGeoJson(ruinedLayer: L.LayerGroup): Promise<void> {
	const file = await fetch('/markers/ruined.geojson');
	const geojsonData = await file.json();
	L.geoJSON(geojsonData, {
		pointToLayer(feature, latlng) {
			const coords = readableCoordinates(latlng);
			const name = feature.properties.name + '<br>';
			const loc = 'N ' + coords[0] + ' E ' + coords[1];
			return L.marker(latlng, {
				title: feature.properties.name + ' N ' + coords[0] + ' E ' + coords[1],
				icon: ruinedIcon
			})
				.bindPopup(name + loc)
				.addTo(ruinedLayer);
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
			const name =
				'<a href="https://bitjita.com/claims/' +
				feature.properties.entityId +
				'" target="_blank">' +
				feature.properties.name +
				'</a>';
			const tier = ' (T' + feature.properties.tier + ')<br>';
			const loc = 'N ' + coords[0] + ' E ' + coords[1] + '<br>';
			const has_bank = 'Bank : ' + (feature.properties.has_bank ? 'Yes' : 'No') + '<br>';
			const has_market = 'Market : ' + (feature.properties.has_market ? 'Yes' : 'No') + '<br>';
			const has_waystone = 'Waystone : ' + (feature.properties.has_waystone ? 'Yes' : 'No');
			const popupText = name + tier + loc + has_bank + has_market + has_waystone;

			const marker = L.marker(latlng, {
				title: feature.properties.name + ' N ' + coords[0] + ' E ' + coords[1],
				icon: claimIcons[feature.properties.tier]
			});

			marker.bindPopup(popupText);
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
			const coords = readableCoordinates(latlng);
			const name = feature.properties.name + '<br>';
			const loc = 'N ' + coords[0] + ' E ' + coords[1];
			return L.marker(latlng, { icon: caveIcons[feature.properties.tier - 1] })
				.bindPopup(name + loc)
				.addTo(caveLayers[feature.properties.tier - 1]);
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
