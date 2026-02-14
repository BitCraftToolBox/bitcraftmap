<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount, setContext } from 'svelte';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { createMapConfig } from '$lib/config/map';
	import { createAppConfig } from '$lib/config/api';
	import { setupDefaultIcon, createIcon } from '$lib/map/create-icon';
	import { initIcons, loadTreesGeoJson, loadTemplesGeoJson, loadRuinedGeoJson, loadClaimsGeoJson, loadCavesGeoJson, loadEventsGeoJson, loadDungeonsGeoJson, loadGridsGeoJson, loadGeoJsonFromHash } from '$lib/map/geojson-loader';
	import { validateGeoJson } from '$lib/map/geojson-validator';
	import { paintGeoJson, type PaintContext } from '$lib/map/geojson-painter';
	import { setMap, saveMapState, restoreMapState, hashHasFlyToOrZoom, resetView } from '$lib/stores/map-store';
	import { parseUrlParams, updatePlayerIdParam, updateResourceIdParam, updateRegionIdParam } from '$lib/utils/url-params';
	import { getRegionState, setRegions } from '$lib/stores/region-store.svelte';
	import { addSearchEntries, type SearchEntry } from '$lib/stores/search-store.svelte';
	import { addTrackingItem, toggleTrackingItem } from '$lib/stores/tracking-store.svelte';
	import { getLatestGistRaw } from '$lib/services/gist-service';
	import { fetchResource, fetchEnemy } from '$lib/services/api-service';
	import { connectWebSocket, type PlayerState, setResourceEventCallback, subscribeResource, closeResourceWebSocket } from '$lib/services/websocket-service';
	import { handleResourceEvent, cancelPendingRefetches, cancelAllPendingRefetches, type ResourceUpdateContext } from '$lib/services/resource-update-handler';
	import { lookupPlayer } from '$lib/services/player-service';
	import { readableCoordinates, formatCoordinates } from '$lib/map/coordinate-utils';
	import { resourceIndex, resourceIndexOverride, creatureIndex } from '$lib/data/resource-index';
	import { tierColors } from '$lib/config/tiers';
	import { filterUnique } from '$lib/utils/dedupe';

	import MapImageLayer from './MapImageLayer.svelte';
	import HeatmapLayer from './HeatmapLayer.svelte';
	import RoadsLayer from './RoadsLayer.svelte';
	import CoordinateDisplay from './CoordinateDisplay.svelte';
	import ResetViewButton from './ResetViewButton.svelte';
	import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
	import SearchBar from '$lib/components/search/SearchBar.svelte';
	import TrackingPanel from '$lib/components/tracking/TrackingPanel.svelte';
	import RegionSelector from '$lib/components/regions/RegionSelector.svelte';


	let mapElement: HTMLDivElement;
	let map = $state<L.Map>(undefined!);
	let mapReady = $state(false);
	let coords = $state('N: 0 E: 0');
	const regionState = getRegionState();

	// All layers
	let eventsLayer: L.LayerGroup;
	let treesLayer: L.LayerGroup;
	let ruinedLayer: L.LayerGroup;
	let templesLayer: L.LayerGroup;
	let banksLayer: L.LayerGroup;
	let marketsLayer: L.LayerGroup;
	let waystonesLayer: L.LayerGroup;
	let gridsLayer: L.LayerGroup;
	let dungeonsLayer: L.LayerGroup;
	let waypointsLayer: L.LayerGroup;
	let roadsLayer: L.LayerGroup;
	let claimLayers: L.LayerGroup[];
	let caveLayers: L.LayerGroup[];
	let allClaims: L.LayerGroup;
	let allCaves: L.LayerGroup;
	let resourceLayers: Record<number, L.LayerGroup> = {};
	let resourceRegionLayers: Record<string, L.LayerGroup> = {};
	let liveLayer: L.FeatureGroup;

	// Toggle mapping for layer panel
	let genericToggle = $state<Record<string, L.LayerGroup>>({});
	let activeLayers = new SvelteSet<string>();
	let allLayers: Record<string, L.LayerGroup> = {};

	// Context for child components
	let paintCtx: PaintContext;

	onMount(() => {
		const mapConfig = createMapConfig();
		const appConfig = createAppConfig();
		const urlParams = parseUrlParams();

		// Seed region store from URL if present (URL takes priority over localStorage)
		if (urlParams.regionId) {
			const urlRegions = urlParams.regionId.split(',').map(Number).filter((n) => n > 0);
			if (urlRegions.length > 0) {
				setRegions(urlRegions);
			}
		}

		// Initialize map
		map = L.map(mapElement, mapConfig);
		setupDefaultIcon();
		initIcons();

		// Create panes
		map.createPane('markerOnTop');
		map.getPane('markerOnTop')!.style.zIndex = '980';
		map.createPane('popupOnTop');
		map.getPane('popupOnTop')!.style.zIndex = '990';

		// Base map image — must set view before calling setMap
		const mapBounds: L.LatLngBoundsExpression = [[0, 0], [mapConfig.mapHeight * mapConfig.apothem, mapConfig.mapWidth]];
		L.imageOverlay(mapConfig.mapImageURL, mapBounds).addTo(map);
		map.fitBounds([[0, 0], [mapConfig.mapWidth, mapConfig.mapHeight]]);
		setMap(map);

		// Create all layer groups
		eventsLayer = L.layerGroup();
		treesLayer = L.layerGroup();
		ruinedLayer = L.layerGroup();
		templesLayer = L.layerGroup();
		banksLayer = L.layerGroup();
		marketsLayer = L.layerGroup();
		waystonesLayer = L.layerGroup();
		gridsLayer = L.layerGroup();
		dungeonsLayer = L.layerGroup();
		waypointsLayer = L.layerGroup();

		claimLayers = Array.from({ length: 11 }, () => L.layerGroup());
		caveLayers = Array.from({ length: 10 }, () => L.layerGroup());
		allClaims = L.layerGroup(claimLayers);
		allCaves = L.layerGroup(caveLayers);

		// Roads
		const roadsBounds: L.LatLngBoundsExpression = [[0, 0], [mapConfig.mapHeight, mapConfig.mapWidth]];
		const roadsImage = L.imageOverlay(`${appConfig.exportsCdn}/bitcraftmap/roads/global-16k.webp`, roadsBounds);
		roadsLayer = L.layerGroup([roadsImage]);

		// Live tracking layer
		liveLayer = L.featureGroup().addTo(map);

		// Build toggle and allLayers maps
		genericToggle = {
			'Events': eventsLayer,
			'Wonders': treesLayer,
			'Temples': templesLayer,
			'Ruined Cities': ruinedLayer,
			'Banks': banksLayer,
			'Markets': marketsLayer,
			'Waystones': waystonesLayer,
			'Grids': gridsLayer,
			'Dungeons': dungeonsLayer,
			'Waypoints': waypointsLayer,
			'Claims': allClaims,
			'Claims T1': claimLayers[1],
			'Claims T2': claimLayers[2],
			'Claims T3': claimLayers[3],
			'Claims T4': claimLayers[4],
			'Claims T5': claimLayers[5],
			'Claims T6': claimLayers[6],
			'Claims T7': claimLayers[7],
			'Claims T8': claimLayers[8],
			'Claims T9': claimLayers[9],
			'Claims T10': claimLayers[10],
			'Caves': allCaves,
			'Caves T1': caveLayers[0],
			'Caves T2': caveLayers[1],
			'Caves T3': caveLayers[2],
			'Caves T4': caveLayers[3],
			'Caves T5': caveLayers[4],
			'Caves T6': caveLayers[5],
			'Caves T7': caveLayers[6],
			'Caves T8': caveLayers[7],
			'Roads': roadsLayer
		};

		allLayers = {
			eventsLayer, treesLayer, templesLayer, ruinedLayer, banksLayer, marketsLayer,
			waystonesLayer, waypointsLayer, dungeonsLayer, roadsLayer,
			claimT0Layer: claimLayers[0], claimT1Layer: claimLayers[1], claimT2Layer: claimLayers[2],
			claimT3Layer: claimLayers[3], claimT4Layer: claimLayers[4], claimT5Layer: claimLayers[5],
			claimT6Layer: claimLayers[6], claimT7Layer: claimLayers[7], claimT8Layer: claimLayers[8],
			claimT9Layer: claimLayers[9], claimT10Layer: claimLayers[10],
			caveT1Layer: caveLayers[0], caveT2Layer: caveLayers[1], caveT3Layer: caveLayers[2],
			caveT4Layer: caveLayers[3], caveT5Layer: caveLayers[4], caveT6Layer: caveLayers[5],
			caveT7Layer: caveLayers[6], caveT8Layer: caveLayers[7], caveT9Layer: caveLayers[8],
			caveT10Layer: caveLayers[9]
		};

		paintCtx = { map, allLayers };

		// Default layers
		eventsLayer.addTo(map);
		treesLayer.addTo(map);
		templesLayer.addTo(map);
		ruinedLayer.addTo(map);
		activeLayers.add('Events');
		activeLayers.add('Wonders');
		activeLayers.add('Temples');
		activeLayers.add('Ruined Cities');

		// Coordinate display
		let hasTouch = false;
		map.on('mousemove', (e: L.LeafletMouseEvent) => {
			coords = formatCoordinates(e.latlng);
		});
		map.getContainer().addEventListener('touchstart', () => { hasTouch = true; }, { once: true });
		map.on('move', () => {
			if (hasTouch) coords = formatCoordinates(map.getCenter());
		});

		// Map state persistence
		map.on('moveend', () => saveMapState(map));

		// Load GeoJSON data
		loadTreesGeoJson(treesLayer);
		loadTemplesGeoJson(templesLayer);
		loadRuinedGeoJson(ruinedLayer).then(() => {
			// Add search entries for ruined cities
			ruinedLayer.eachLayer((l) => {
				const marker = l as L.Marker;
				if (marker.options?.title) {
					addSearchEntries([{
						title: marker.options.title,
						latlng: marker.getLatLng(),
						layer: ruinedLayer,
						marker
					}]);
				}
			});
		});
		loadCavesGeoJson(caveLayers);
		loadClaimsGeoJson(claimLayers, banksLayer, marketsLayer, waystonesLayer).then(() => {
			// Add search entries for claims
			for (const claimLayer of claimLayers) {
				claimLayer.eachLayer((l) => {
					const marker = l as L.Marker;
					if (marker.options?.title) {
						addSearchEntries([{
							title: marker.options.title,
							latlng: marker.getLatLng(),
							layer: claimLayer,
							marker
						}]);
					}
				});
			}
		});
		loadEventsGeoJson(eventsLayer, paintCtx);
		loadDungeonsGeoJson(dungeonsLayer, paintCtx);

		// Lazy-load grids
		gridsLayer.once('add', () => loadGridsGeoJson(gridsLayer, paintCtx));

		// Load from hash / gist / backend
		loadGeoJsonFromHash(waypointsLayer, paintCtx, map);

		if (urlParams.gistId) {
			getLatestGistRaw(urlParams.gistId).then((content) => {
				const geoJson = validateGeoJson(content);
				paintGeoJson(geoJson, waypointsLayer, paintCtx);
				map.addLayer(waypointsLayer);
			}).catch(console.error);
		}

		// Backend resource/enemy loading
		loadBackendData(urlParams, map).catch(console.error);

		// Heatmap
		if (urlParams.heatmap) {
			const heatmapBounds: L.LatLngBoundsExpression = [[0, 0], [mapConfig.mapHeight, mapConfig.mapWidth]];
			L.imageOverlay('/maps/heatmap.png', heatmapBounds).addTo(map);
		}

		// WebSocket player tracking from URL params
		if (urlParams.playerId) {
			const playerIds = urlParams.playerId.split(',').map((id) => id.trim()).filter(Boolean);
			for (const id of playerIds) {
				trackedPlayerIds.add(id);
			}

			// Fetch player info once for initial markers + tracking items
			const playerInfoPromise = Promise.all(playerIds.map((id) => lookupPlayer(id)));

			playerInfoPromise.then((results) => {
				results.forEach((info, i) => {
					if (info.locationX !== null && info.locationZ !== null) {
						updatePlayerMarker({
							entity_id: playerIds[i],
							location_x: info.locationX,
							location_z: info.locationZ,
							destination_x: info.locationX,
							destination_z: info.locationZ
						}, urlParams.followPlayer);
					}
				});
			});

			const ws = connectWebSocket(playerIds, (state: PlayerState) => {
				updatePlayerMarker(state, urlParams.followPlayer);
			}, () => {
				playerInfoPromise.then((results) => {
					playerIds.forEach((id, i) => {
						addTrackingItem({
							id: -1,
							entityId: id,
							type: 'player',
							text: `Player: ${results[i].username}`,
							color: '#00ff00',
							visible: true
						});
					});
				});
			});
			if (ws) {
				for (const id of playerIds) {
					playerWebSockets.set(id, ws);
				}
			}
		}

		// Restore map state
		if (!hashHasFlyToOrZoom()) {
			restoreMapState(map);
		}

		mapReady = true;

		// Wire up resource WebSocket event handler
		setResourceEventCallback((event) => {
			handleResourceEvent(event, resourceUpdateCtx);
		});

		return () => {
			for (const ws of playerWebSockets.values()) {
				ws.close();
			}
			closeResourceWebSocket();
			cancelAllPendingRefetches();
			map.remove();
		};
	});

	// Resource tracking state
	const trackedResourceIds = new Set<number>();

	function getColorForResource(resourceId: number): string {
		return resourceIndexOverride[resourceId]?.color
			|| tierColors[resourceIndexOverride[resourceId]?.tier]
			|| resourceIndex[resourceId]?.color
			|| tierColors[resourceIndex[resourceId]?.tier]
			|| '#3388ff';
	}

	const resourceUpdateCtx: ResourceUpdateContext = {
		get resourceRegionLayers() { return resourceRegionLayers; },
		get resourceLayers() { return resourceLayers; },
		get paintCtx() { return paintCtx; },
		getColorForResource,
		getActiveRegions: () => regionState.effectiveRegions
	};

	// Player tracking state
	const playerStore = new Map<string, L.CircleMarker>();
	const destinationStore = new Map<string, L.Polyline>();
	const playerWebSockets = new Map<string, WebSocket>();
	const trackedPlayerIds = new Set<string>();

	const playerColorPalette = ['#00ff00', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a78bfa', '#f97316', '#06b6d4', '#ec4899'];
	let playerColorIndex = 0;

	async function handlePlayerSelect(entityId: string, username: string): Promise<void> {
		if (trackedPlayerIds.has(entityId)) return;
		trackedPlayerIds.add(entityId);
		updatePlayerIdParam(trackedPlayerIds);

		const color = playerColorPalette[playerColorIndex % playerColorPalette.length];
		playerColorIndex++;

		// Fetch initial location from API
		const playerInfo = await lookupPlayer(entityId);
		if (playerInfo.locationX !== null && playerInfo.locationZ !== null) {
			updatePlayerMarker({
				entity_id: entityId,
				location_x: playerInfo.locationX,
				location_z: playerInfo.locationZ,
				destination_x: playerInfo.locationX,
				destination_z: playerInfo.locationZ
			}, false, color);
		}

		const ws = connectWebSocket([entityId], (state: PlayerState) => {
			updatePlayerMarker(state, false, color);
		}, () => {
			addTrackingItem({
				id: -1,
				entityId,
				type: 'player',
				text: `Player: ${playerInfo.username}`,
				color,
				visible: true
			});
		});

		if (ws) {
			playerWebSockets.set(entityId, ws);
		}
	}

	function handleTogglePlayerVisibility(entityId: string): void {
		const marker = playerStore.get(entityId);
		const dest = destinationStore.get(entityId);
		if (marker) {
			if (liveLayer.hasLayer(marker)) {
				liveLayer.removeLayer(marker);
				if (dest) liveLayer.removeLayer(dest);
			} else {
				liveLayer.addLayer(marker);
				if (dest) liveLayer.addLayer(dest);
			}
		}
	}

	function updatePlayerMarker(state: PlayerState, followPlayer: boolean, color = '#00ff00'): void {
		const playerId = state.entity_id;
		const playerLatLng = L.latLng(state.location_z / 1000, state.location_x / 1000);
		const destLatLng = L.latLng(state.destination_z / 1000, state.destination_x / 1000);
		const directionLine: L.LatLngExpression[] = [playerLatLng, destLatLng];

		const existingMarker = playerStore.get(playerId);
		const existingDest = destinationStore.get(playerId);

		if (!existingMarker || !existingDest) {
			const marker = new L.CircleMarker(playerLatLng, {
				color,
				radius: 4,
				weight: 1,
				opacity: 1,
				fillOpacity: 1
			}).addTo(liveLayer);
			marker.bindPopup('PlayerId: ' + playerId);

			const trail = new L.Polyline(directionLine, {
				color: '#ff0000ff',
				weight: 1,
				opacity: 1,
				smoothFactor: 1
			}).addTo(liveLayer);

			playerStore.set(playerId, marker);
			destinationStore.set(playerId, trail);
		} else {
			existingMarker.setLatLng(playerLatLng);
			existingDest.setLatLngs(directionLine);
		}

		if (followPlayer) {
			map.flyTo(playerLatLng, map.getZoom());
		}
	}

	async function handleResourceSelect(resourceId: number, name: string, tier: number): Promise<void> {
		if (resourceLayers[resourceId]) return; // already loaded

		trackedResourceIds.add(resourceId);
		updateResourceIdParam(trackedResourceIds);

		const color = tierColors[tier] || '#3388ff';
		resourceLayers[resourceId] = L.layerGroup();
		map.addLayer(resourceLayers[resourceId]);

		addTrackingItem({
			id: resourceId,
			type: 'resource',
			text: `Tracking: ${name}, Tier ${tier}`,
			color,
			visible: true
		});

		try {
			const regions = regionState.effectiveRegions;
			const results = await Promise.all(regions.map((rId) => fetchResource(rId, resourceId)));

			regions.forEach((rId, idx) => {
				const geoJson = results[idx];
				if (geoJson.features[0]?.geometry &&
					(geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates?.length > 0) {
					const key = `${resourceId}-${rId}`;
					const regionLayer = L.layerGroup();
					resourceRegionLayers[key] = regionLayer;
					resourceLayers[resourceId].addLayer(regionLayer);

					const props = geoJson.features[0].properties as Record<string, unknown>;
					props.fillColor = color;
					paintGeoJson(geoJson, regionLayer, paintCtx, false);
				}
			});

			subscribeResource(resourceId);
		} catch (err) {
			console.error(`Failed to load resource ${resourceId}:`, err);
		}
	}

	async function loadBackendData(urlParams: ReturnType<typeof parseUrlParams>, map: L.Map): Promise<void> {
		const { resourceId: resourceParam, enemyId: enemyParam, noColors } = urlParams;

		if (!resourceParam && !enemyParam) return;

		const regionIds = regionState.effectiveRegions;

		let resourceIds: number[] = [];
		if (resourceParam) {
			if (!/^([0-9]\d*)(,([0-9]\d*))*$/.test(resourceParam)) return;
			resourceIds = [...new Set(resourceParam.split(',').map(Number))];
			for (const id of resourceIds) {
				trackedResourceIds.add(id);
			}
		}

		let enemyIds: number[] = [];
		if (enemyParam) {
			if (!/^([0-9]\d*)(,([0-9]\d*))*$/.test(enemyParam)) return;
			enemyIds = [...new Set(enemyParam.split(',').map(Number))];
		}

		const fetchPromises: Promise<GeoJSON.FeatureCollection>[] = [];
		const geoJsonMeta: { region: number; fillColor: string; resource: number }[] = [];
		let trackingList: { text: string; color: string; id: number }[] = [];

		for (const id of resourceIds) {
			resourceLayers[id] = L.layerGroup();
			map.addLayer(resourceLayers[id]);
		}
		for (const id of enemyIds) {
			resourceLayers[id] = L.layerGroup();
			map.addLayer(resourceLayers[id]);
		}

		for (const rId of regionIds) {
			for (const resId of resourceIds) {
				let color = resourceIndexOverride[resId]?.color
					|| tierColors[resourceIndexOverride[resId]?.tier]
					|| resourceIndex[resId]?.color
					|| tierColors[resourceIndex[resId]?.tier]
					|| '#3388ff';
				if (noColors) color = '#3388ff';
				const tier = resourceIndexOverride[resId]?.tier || resourceIndex[resId]?.tier || 0;
				const name = resourceIndex[resId]?.name || 'ID ' + resId;
				geoJsonMeta.push({ region: rId, fillColor: color, resource: resId });
				fetchPromises.push(fetchResource(rId, resId));
				trackingList.push({ text: 'Tracking: ' + name + ', Tier ' + tier, color, id: resId });
			}
			for (const eId of enemyIds) {
				let color = creatureIndex[eId]?.color
					|| tierColors[creatureIndex[eId]?.tier]
					|| '#3388ff';
				if (noColors) color = '#3388ff';
				const tier = creatureIndex[eId]?.tier || 0;
				const name = creatureIndex[eId]?.name || 'ID ' + eId;
				geoJsonMeta.push({ region: rId, fillColor: color, resource: eId });
				fetchPromises.push(fetchEnemy(rId, eId));
				trackingList.push({ text: 'Tracking: ' + name + ', Tier ' + tier, color, id: eId });
			}
		}

		trackingList = filterUnique(trackingList);
		for (const item of trackingList) {
			addTrackingItem({
				id: item.id,
				type: 'resource',
				text: item.text,
				color: item.color,
				visible: true
			});
		}

		if (fetchPromises.length === 0) return;
		const geoJsonResults = await Promise.all(fetchPromises);

		geoJsonResults.forEach((geoJson, idx) => {
			if (geoJson.features[0]?.geometry &&
				(geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates?.length > 0) {
				const props = geoJson.features[0].properties as Record<string, unknown>;
				props.fillColor = geoJsonMeta[idx].fillColor || '#3388ff';
				if (props.tier != null) {
					props.fillColor = tierColors[props.tier as number] || tierColors[0];
				}

				const meta = geoJsonMeta[idx];
				const key = `${meta.resource}-${meta.region}`;
				const regionLayer = L.layerGroup();
				resourceRegionLayers[key] = regionLayer;
				resourceLayers[meta.resource].addLayer(regionLayer);
				paintGeoJson(geoJson, regionLayer, paintCtx, false);
			}
		});

		// Subscribe to resource WebSocket channels
		for (const id of resourceIds) {
			subscribeResource(id);
		}
	}

	function handleToggleLayer(name: string): void {
		const layer = genericToggle[name];
		if (!layer || !map) return;
		if (map.hasLayer(layer)) {
			map.removeLayer(layer);
			activeLayers.delete(name);
		} else {
			map.addLayer(layer);
			activeLayers.add(name);
		}
	}

	function handleToggleResourceLayer(id: number): void {
		const layer = resourceLayers[id];
		if (!layer || !map) return;
		if (map.hasLayer(layer)) {
			map.removeLayer(layer);
		} else {
			map.addLayer(layer);
		}
	}

	function handleRegionsChange(): void {
		updateRegionIdParam(regionState.selected);

		const currentTrackedIds = [...trackedResourceIds];
		if (currentTrackedIds.length === 0) return;

		cancelAllPendingRefetches();

		// Clear existing region sub-layers
		for (const id of currentTrackedIds) {
			const layer = resourceLayers[id];
			if (layer) layer.clearLayers();
			// Remove stale region sub-layer references
			for (const key of Object.keys(resourceRegionLayers)) {
				if (key.startsWith(`${id}-`)) {
					delete resourceRegionLayers[key];
				}
			}
		}

		const regions = regionState.effectiveRegions;
		for (const resourceId of currentTrackedIds) {
			const color = getColorForResource(resourceId);

			Promise.all(regions.map((rId) => fetchResource(rId, resourceId)))
				.then((results) => {
					regions.forEach((rId, idx) => {
						const geoJson = results[idx];
						if (
							geoJson.features[0]?.geometry &&
							(geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates?.length > 0
						) {
							const key = `${resourceId}-${rId}`;
							const regionLayer = L.layerGroup();
							resourceRegionLayers[key] = regionLayer;
							resourceLayers[resourceId].addLayer(regionLayer);

							const props = geoJson.features[0].properties as Record<string, unknown>;
							props.fillColor = color;
							paintGeoJson(geoJson, regionLayer, paintCtx, false);
						}
					});
				})
				.catch((err) => console.error(`Failed to reload resource ${resourceId}:`, err));
		}
	}

	function isLayerActive(name: string): boolean {
		return activeLayers.has(name);
	}

	function handleSearchSelect(entry: { latlng: L.LatLng; layer: L.LayerGroup }): void {
		if (!map.hasLayer(entry.layer)) {
			map.addLayer(entry.layer);
		}
		map.flyTo(entry.latlng, map.getZoom());
	}

	setContext('map', {
		getMap: () => map,
		toggleLayer: handleToggleLayer,
		isLayerActive,
		handleSearchSelect,
		handleToggleResourceLayer,
		genericToggle: () => genericToggle
	});
</script>

<div class="relative h-screen w-screen overflow-hidden bg-[#1a1f2e]">
	<div bind:this={mapElement} class="absolute inset-0 z-map"></div>

	{#if mapReady}
		<SearchBar onSelect={handleSearchSelect} onPlayerSelect={handlePlayerSelect} onResourceSelect={handleResourceSelect} />
		<RegionSelector onRegionsChange={handleRegionsChange} />
		<LayerPanel
			{genericToggle}
			isActive={isLayerActive}
			onToggle={handleToggleLayer}
		/>
		<TrackingPanel onToggleResource={handleToggleResourceLayer} onTogglePlayer={handleTogglePlayerVisibility} />
	{/if}

	<div class="absolute bottom-3 left-3 z-ui flex items-center gap-2">
		<CoordinateDisplay {coords} />
		<ResetViewButton onReset={resetView} />
	</div>
</div>

<style>
	:global(.leaflet-container) {
		background: #2a3145;
	}

	:global(.leaflet-tile-pane img),
	:global(.leaflet-overlay-pane img) {
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
		will-change: transform;
		backface-visibility: hidden;
	}
</style>
