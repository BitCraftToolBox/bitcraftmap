<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { onMount, setContext } from "svelte";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import "leaflet.markercluster";
  import { createMapConfig } from "$lib/config/map";
  import { createAppConfig } from "$lib/config/api";
  import { env } from "$env/dynamic/public";
  import { setupDefaultIcon, createIcon } from "$lib/map/create-icon";
  import {
    initIcons,
    loadTreesGeoJson,
    loadTemplesGeoJson,
    loadRuinedGeoJson,
    loadClaimsGeoJson,
    loadCavesGeoJson,
    loadEventsGeoJson,
    loadDungeonsGeoJson,
    loadGridsGeoJson,
    loadTowersGeoJson,
    loadGeoJsonFromHash,
  } from "$lib/map/geojson-loader";
  import { validateGeoJson } from "$lib/map/geojson-validator";
  import { paintGeoJson, type PaintContext } from "$lib/map/geojson-painter";
  import { ResourceCanvasLayer } from "$lib/map/resource-canvas-layer";
  import {
    setMap,
    saveMapState,
    restoreMapState,
    hashHasFlyToOrZoom,
    resetView,
  } from "$lib/stores/map-store";
  import {
    parseUrlParams,
    updatePlayerIdParam,
    updateResourceIdParam,
    updateEnemyIdParam,
    updateRegionIdParam,
  } from "$lib/utils/url-params";
  import { getRegionState, setRegions } from "$lib/stores/region-store.svelte";
  import {
    addSearchEntries,
    type SearchEntry,
  } from "$lib/stores/search-store.svelte";
  import {
    addTrackingItem,
    toggleTrackingItem,
    loadColorPreference,
  } from "$lib/stores/tracking-store.svelte";
  import { getLatestGistRaw } from "$lib/services/gist-service";
  import { fetchResource, fetchEnemy } from "$lib/services/api-service";
  import {
    connectWebSocket,
    type PlayerState,
    setResourceEventCallback,
    subscribeResource,
    unsubscribeResource,
    closeResourceWebSocket,
  } from "$lib/services/websocket-service";
  import {
    handleResourceEvent,
    cancelPendingRefetches,
    cancelAllPendingRefetches,
    type ResourceUpdateContext,
  } from "$lib/services/resource-update-handler";
  import { lookupPlayer } from "$lib/services/player-service";
  import {
    readableCoordinates,
    formatCoordinates,
  } from "$lib/map/coordinate-utils";
  import {
    resourceIndex,
    resourceIndexOverride,
    creatureIndex,
  } from "$lib/data/resource-index";
  import { tierColors } from "$lib/config/tiers";
  import { filterUnique } from "$lib/utils/dedupe";

  import MapImageLayer from "./MapImageLayer.svelte";
  import HeatmapLayer from "./HeatmapLayer.svelte";
  import RoadsLayer from "./RoadsLayer.svelte";
  import CoordinateDisplay from "./CoordinateDisplay.svelte";
  import ResetViewButton from "./ResetViewButton.svelte";
  import GameTimers from "./GameTimers.svelte";
  import { setSelection } from "$lib/stores/selection-store.svelte";
  import { buildPopupHtml } from "$lib/map/popup-builder";
  import SearchBar from "$lib/components/search/SearchBar.svelte";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import DetailPanel from "$lib/components/detail/DetailPanel.svelte";

  let mapElement: HTMLDivElement;
  let map = $state<L.Map>(undefined!);
  let mapReady = $state(false);
  let coords = $state("N: 0 E: 0");
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
  let towersLayer: L.LayerGroup;
  let hexiteLayer: L.LayerGroup;
  let waypointsLayer: L.LayerGroup;
  let roadsLayer: L.LayerGroup;
  let claimLayers: L.LayerGroup[];
  let caveLayers: L.LayerGroup[];
  let allClaims: L.LayerGroup;
  let allCaves: L.LayerGroup;
  let resourceLayers: Record<number, ResourceCanvasLayer> = {};
  let liveLayer: L.FeatureGroup;
  let baseMapOverlay: L.ImageOverlay;
  let hiResLoaded = $state(false);
  let hiResUrl = "";
  let initialMapUrl = "";
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const showHiResToggle = isMobile || import.meta.env.DEV;

  // Toggle mapping for layer panel
  let genericToggle = $state<Record<string, L.LayerGroup>>({});
  let activeLayers = new SvelteSet<string>();
  let allLayers: Record<string, L.LayerGroup> = {};

  const LAYERS_STORAGE_KEY = "activeLayers";
  const DEFAULT_LAYERS = ["Events", "Wonders", "Temples", "Ruined Cities"];

  function loadActiveLayers(): string[] | null {
    try {
      const stored = localStorage.getItem(LAYERS_STORAGE_KEY);
      if (stored === null) return null;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return null;
      return parsed.filter((v): v is string => typeof v === "string");
    } catch {
      return null;
    }
  }

  function saveActiveLayers(): void {
    try {
      localStorage.setItem(
        LAYERS_STORAGE_KEY,
        JSON.stringify([...activeLayers]),
      );
    } catch {
      /* ignore */
    }
  }

  // Context for child components
  let paintCtx: PaintContext;
  const mapConfig = createMapConfig();

  onMount(() => {
    const appConfig = createAppConfig();
    const urlParams = parseUrlParams();

    // Seed region store from URL if present (URL takes priority over localStorage)
    if (urlParams.regionId) {
      const urlRegions = urlParams.regionId
        .split(",")
        .map(Number)
        .filter((n) => n > 0);
      if (urlRegions.length > 0) {
        setRegions(urlRegions);
      }
    }

    // Initialize map
    map = L.map(mapElement, mapConfig);
    setupDefaultIcon();
    initIcons();

    // Create panes
    map.createPane("baseMapPane");
    map.getPane("baseMapPane")!.style.zIndex = "100";
    map.createPane("markerOnTop");
    map.getPane("markerOnTop")!.style.zIndex = "980";
    map.createPane("popupOnTop");
    map.getPane("popupOnTop")!.style.zIndex = "990";

    // Base map image — placed in baseMapPane (below tilePane) so road tiles render on top
    const mapBounds: L.LatLngBoundsExpression = [
      [0, 0],
      [mapConfig.mapHeight, mapConfig.mapWidth],
    ];
    const useCdnMap = env.PUBLIC_CDN_MAP === 'true';
    initialMapUrl = useCdnMap
      ? `${appConfig.exportsCdn}/bitcraftmap/maps/global-2560.webp`
      : "/assets/maps/map.webp";
    baseMapOverlay = L.imageOverlay(initialMapUrl, mapBounds, {
      pane: "baseMapPane",
    }).addTo(map);
    map.fitBounds([
      [0, 0],
      [mapConfig.mapWidth, mapConfig.mapHeight],
    ]);

    // Preload hi-res map in background from CDN (only when CDN is enabled)
    hiResUrl = `${appConfig.exportsCdn}/bitcraftmap/maps/global-12800.webp`;
    if (useCdnMap) {
      const hiRes = new Image();
      hiRes.onload = () => {
        hiResLoaded = true;
        if (!showHiResToggle) baseMapOverlay.setUrl(hiResUrl);
      };
      hiRes.src = hiResUrl;
    }
    setMap(map);

    // Create all layer groups
    // Only use MarkerClusterGroup for caves (1642 markers) — other layers are small enough (<100) for plain LayerGroups
    eventsLayer = L.layerGroup();
    treesLayer = L.layerGroup();
    ruinedLayer = L.layerGroup();
    templesLayer = L.layerGroup();
    banksLayer = L.layerGroup();
    marketsLayer = L.layerGroup();
    waystonesLayer = L.layerGroup();
    gridsLayer = L.layerGroup();
    dungeonsLayer = L.layerGroup();
    towersLayer = L.layerGroup();
    hexiteLayer = L.layerGroup();
    waypointsLayer = L.layerGroup();

    claimLayers = Array.from({ length: 11 }, () => L.layerGroup());
    caveLayers = Array.from({ length: 10 }, (_, i) => {
      const iconUrl = `/images/ore/t${i + 1}.webp`;
      return L.markerClusterGroup({
        maxClusterRadius: 50,
        disableClusteringAtZoom: 2,
        chunkedLoading: true,
        chunkInterval: 100,
        animate: false,
        iconCreateFunction(cluster) {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<img src="${iconUrl}" /><span class="cluster-count">${count}</span>`,
            className: "cave-cluster-icon",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
        },
      });
    });
    allClaims = L.layerGroup(claimLayers);
    allCaves = L.layerGroup(caveLayers);

    const roadsBounds: L.LatLngBoundsExpression = [
      [0, 0],
      [mapConfig.mapHeight, mapConfig.mapWidth],
    ];
    const roadsTileLayer = L.tileLayer(
      `${appConfig.exportsCdn}/bitcraftmap/roads/tiles/{z}/{x}/{y}.webp`,
      {
        bounds: roadsBounds,
        minZoom: -5,
        maxZoom: 5,
        minNativeZoom: -5,
        maxNativeZoom: 0,
        tileSize: 256,
        keepBuffer: 4,
        updateWhenZooming: false,
        errorTileUrl: "",
      },
    );
    (roadsTileLayer as any)._isValidTile = function (coords: {
      x: number;
      y: number;
      z: number;
    }) {
      const tileBounds = (this as any)._tileCoordsToBounds(coords);
      return L.latLngBounds(roadsBounds).overlaps(tileBounds);
    };
    roadsLayer = L.layerGroup([roadsTileLayer]);

    // Live tracking layer
    liveLayer = L.featureGroup().addTo(map);

    // Build toggle and allLayers maps
    genericToggle = {
      Events: eventsLayer,
      Wonders: treesLayer,
      "Hexite Deposits": hexiteLayer,
      Temples: templesLayer,
      "Ruined Cities": ruinedLayer,
      Banks: banksLayer,
      Markets: marketsLayer,
      Waystones: waystonesLayer,
      Grids: gridsLayer,
      Dungeons: dungeonsLayer,
      Watchtowers: towersLayer,
      Waypoints: waypointsLayer,
      Claims: allClaims,
      "Claims T1": claimLayers[1],
      "Claims T2": claimLayers[2],
      "Claims T3": claimLayers[3],
      "Claims T4": claimLayers[4],
      "Claims T5": claimLayers[5],
      "Claims T6": claimLayers[6],
      "Claims T7": claimLayers[7],
      "Claims T8": claimLayers[8],
      "Claims T9": claimLayers[9],
      "Claims T10": claimLayers[10],
      Caves: allCaves,
      "Caves T1": caveLayers[0],
      "Caves T2": caveLayers[1],
      "Caves T3": caveLayers[2],
      "Caves T4": caveLayers[3],
      "Caves T5": caveLayers[4],
      "Caves T6": caveLayers[5],
      "Caves T7": caveLayers[6],
      "Caves T8": caveLayers[7],
      "Caves T9": caveLayers[8],
      "Caves T10": caveLayers[9],
      Roads: roadsLayer,
    };

    allLayers = {
      eventsLayer,
      treesLayer,
      hexiteLayer,
      templesLayer,
      ruinedLayer,
      banksLayer,
      marketsLayer,
      waystonesLayer,
      waypointsLayer,
      dungeonsLayer,
      towersLayer,
      roadsLayer,
      claimT0Layer: claimLayers[0],
      claimT1Layer: claimLayers[1],
      claimT2Layer: claimLayers[2],
      claimT3Layer: claimLayers[3],
      claimT4Layer: claimLayers[4],
      claimT5Layer: claimLayers[5],
      claimT6Layer: claimLayers[6],
      claimT7Layer: claimLayers[7],
      claimT8Layer: claimLayers[8],
      claimT9Layer: claimLayers[9],
      claimT10Layer: claimLayers[10],
      caveT1Layer: caveLayers[0],
      caveT2Layer: caveLayers[1],
      caveT3Layer: caveLayers[2],
      caveT4Layer: caveLayers[3],
      caveT5Layer: caveLayers[4],
      caveT6Layer: caveLayers[5],
      caveT7Layer: caveLayers[6],
      caveT8Layer: caveLayers[7],
      caveT9Layer: caveLayers[8],
      caveT10Layer: caveLayers[9],
    };

    paintCtx = { map, allLayers };

    // Restore saved layers or use defaults
    const saved = loadActiveLayers();
    const layersToActivate = saved ?? DEFAULT_LAYERS;
    for (const name of layersToActivate) {
      const layer = genericToggle[name];
      if (layer) {
        layer.addTo(map);
        activeLayers.add(name);
      }
    }

    // Coordinate display (throttled to ~10fps via rAF to avoid unnecessary work)
    let hasTouch = false;
    let mouseMoveRaf = false;
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      if (mouseMoveRaf) return;
      mouseMoveRaf = true;
      requestAnimationFrame(() => {
        mouseMoveRaf = false;
        coords = `${formatCoordinates(e.latlng)} Zoom: ${map.getZoom().toFixed(1)}`;
      });
    });
    map.getContainer().addEventListener(
      "touchstart",
      () => {
        hasTouch = true;
      },
      { once: true },
    );
    map.on("move", () => {
      if (hasTouch)
        coords = `${formatCoordinates(map.getCenter())} Zoom: ${map.getZoom().toFixed(1)}`;
    });
    map.on("zoomend", () => {
      coords = coords.replace(
        /Zoom: -?[\d.]+/,
        `Zoom: ${map.getZoom().toFixed(1)}`,
      );
    });

    // Handle action buttons inside Leaflet popups
    map.on("popupopen", (e: L.PopupEvent) => {
      const container = e.popup.getElement();
      if (!container) return;
      container.addEventListener("click", (ev) => {
        const btn = (ev.target as HTMLElement).closest(
          "[data-action]",
        ) as HTMLElement | null;
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === "track-resource") {
          const id = Number(btn.dataset.resourceId);
          const name = btn.dataset.resourceName ?? "";
          const tier = Number(btn.dataset.resourceTier);
          if (id) handleResourceSelect(id, name, tier);
          map.closePopup();
        } else if (action === "follow-player") {
          const entityId = btn.dataset.entityId ?? "";
          const username = btn.dataset.username ?? "";
          if (entityId) handlePlayerSelect(entityId, username);
          map.closePopup();
        }
      });
    });

    // Map state persistence
    map.on("moveend", () => saveMapState(map));

    // Load GeoJSON data
    loadTreesGeoJson(treesLayer, hexiteLayer);
    loadTemplesGeoJson(templesLayer);
    loadRuinedGeoJson(ruinedLayer).then(() => {
      // Add search entries for ruined cities
      ruinedLayer.eachLayer((l) => {
        const marker = l as L.Marker;
        if (marker.options?.title) {
          addSearchEntries([
            {
              title: marker.options.title,
              latlng: marker.getLatLng(),
              layer: ruinedLayer,
              marker,
              selectionData: (marker as any)._selectionData,
            },
          ]);
        }
      });
    });
    loadCavesGeoJson(caveLayers);
    loadClaimsGeoJson(
      claimLayers,
      banksLayer,
      marketsLayer,
      waystonesLayer,
    ).then(() => {
      // Add search entries for claims
      for (const claimLayer of claimLayers) {
        claimLayer.eachLayer((l) => {
          const marker = l as L.Marker;
          if (marker.options?.title) {
            addSearchEntries([
              {
                title: marker.options.title,
                latlng: marker.getLatLng(),
                layer: claimLayer,
                marker,
                selectionData: (marker as any)._selectionData,
              },
            ]);
          }
        });
      }
    });
    loadEventsGeoJson(eventsLayer, paintCtx);
    loadDungeonsGeoJson(dungeonsLayer);

    // Lazy-load grids and towers
    gridsLayer.once("add", () => loadGridsGeoJson(gridsLayer, paintCtx));
    towersLayer.once("add", () => loadTowersGeoJson(towersLayer, map));

    // Load from hash / gist / backend
    loadGeoJsonFromHash(waypointsLayer, paintCtx, map);

    if (urlParams.gistId) {
      getLatestGistRaw(urlParams.gistId)
        .then((content) => {
          const geoJson = validateGeoJson(content);
          paintGeoJson(geoJson, waypointsLayer, paintCtx);
          map.addLayer(waypointsLayer);
        })
        .catch(console.error);
    }

    // Backend resource/enemy loading
    loadBackendData(urlParams, map).catch(console.error);

    // Heatmap
    if (urlParams.heatmap) {
      const heatmapBounds: L.LatLngBoundsExpression = [
        [0, 0],
        [mapConfig.mapHeight, mapConfig.mapWidth],
      ];
      L.imageOverlay("/maps/heatmap.png", heatmapBounds).addTo(map);
    }

    // WebSocket player tracking from URL params
    if (urlParams.playerId) {
      const playerIds = urlParams.playerId
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      for (const id of playerIds) {
        trackedPlayerIds.add(id);
      }

      // Fetch player info once for initial markers + tracking items
      const playerInfoPromise = Promise.all(
        playerIds.map((id) => lookupPlayer(id)),
      );

      playerInfoPromise.then((results) => {
        results.forEach((info, i) => {
          playerUsernames.set(playerIds[i], info.username);
          if (info.locationX !== null && info.locationZ !== null) {
            updatePlayerMarker(
              {
                entity_id: playerIds[i],
                location_x: info.locationX,
                location_z: info.locationZ,
                destination_x: info.locationX,
                destination_z: info.locationZ,
              },
              urlParams.followPlayer,
            );
          }
        });
      });

      const ws = connectWebSocket(
        playerIds,
        (state: PlayerState) => {
          updatePlayerMarker(state, urlParams.followPlayer);
        },
        () => {
          playerInfoPromise.then((results) => {
            playerIds.forEach((id, i) => {
              const savedColor = loadColorPreference('player', id);
              addTrackingItem({
                id: -1,
                entityId: id,
                type: "player",
                text: `Player: ${results[i].username}`,
                color: savedColor || "#00ff00",
                visible: true,
              });
            });
          });
        },
      );
      if (ws) {
        for (const id of playerIds) {
          playerWebSockets.set(id, ws);
        }
      }
    }

    // Restore map state
    if (urlParams.center) {
      const [n, e] = urlParams.center;
      const zoom = Math.min(Math.max(urlParams.zoom ?? map.getZoom(), map.getMinZoom()), map.getMaxZoom());
      map.flyTo([n * 3, e * 3], zoom);
    } else if (!hashHasFlyToOrZoom()) {
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
  const trackedEnemyIds = new Set<number>();

  const resourceUpdateCtx: ResourceUpdateContext = {
    get resourceLayers() {
      return resourceLayers;
    },
    getActiveRegions: () => regionState.effectiveRegions,
  };

  // Player tracking state
  const playerStore = new Map<string, L.Marker>();
  const destinationStore = new Map<string, L.Polyline>();
  const playerWebSockets = new Map<string, WebSocket>();
  const trackedPlayerIds = new Set<string>();
  const playerUsernames = new Map<string, string>();

  const playerColorPalette = [
    "#00ff00",
    "#ff6b6b",
    "#4ecdc4",
    "#ffe66d",
    "#a78bfa",
    "#f97316",
    "#06b6d4",
    "#ec4899",
  ];
  let playerColorIndex = 0;

  async function handlePlayerSelect(
    entityId: string,
    username: string,
  ): Promise<void> {
    if (trackedPlayerIds.has(entityId)) return;
    trackedPlayerIds.add(entityId);
    playerUsernames.set(entityId, username);
    updatePlayerIdParam(trackedPlayerIds);

    const color =
      playerColorPalette[playerColorIndex % playerColorPalette.length];
    playerColorIndex++;

    // Fetch initial location from API
    const playerInfo = await lookupPlayer(entityId);
    if (playerInfo.locationX !== null && playerInfo.locationZ !== null) {
      updatePlayerMarker(
        {
          entity_id: entityId,
          location_x: playerInfo.locationX,
          location_z: playerInfo.locationZ,
          destination_x: playerInfo.locationX,
          destination_z: playerInfo.locationZ,
        },
        false,
        color,
      );
    }

    const ws = connectWebSocket(
      [entityId],
      (state: PlayerState) => {
        updatePlayerMarker(state, false, color);
      },
      () => {
        addTrackingItem({
          id: -1,
          entityId,
          type: "player",
          text: `Player: ${playerInfo.username}`,
          color: loadColorPreference('player', entityId) || color,
          visible: true,
        });
      },
    );

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

  function createPlayerIcon(color: string): L.DivIcon {
    return L.divIcon({
      className: "player-marker-icon",
      html: `<div class="player-pulse" style="border-color: ${color};"></div><div class="player-dot" style="background-color: ${color};"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  }

  function updatePlayerMarker(
    state: PlayerState,
    followPlayer: boolean,
    color = "#00ff00",
  ): void {
    const playerId = state.entity_id;
    const playerLatLng = L.latLng(
      state.location_z / 1000,
      state.location_x / 1000,
    );
    const destLatLng = L.latLng(
      state.destination_z / 1000,
      state.destination_x / 1000,
    );
    const directionLine: L.LatLngExpression[] = [playerLatLng, destLatLng];

    const existingMarker = playerStore.get(playerId);
    const existingDest = destinationStore.get(playerId);

    if (!existingMarker || !existingDest) {
      const icon = createPlayerIcon(color);
      const marker = L.marker(playerLatLng, {
        icon,
        pane: "markerOnTop",
      }).addTo(liveLayer);
      const username = playerUsernames.get(playerId) ?? playerId;
      const selectionData = {
        type: "player" as const,
        name: username,
        entityId: playerId,
        username,
        signedIn: true,
        latlng: { lat: playerLatLng.lat, lng: playerLatLng.lng },
        color,
      };
      marker.bindPopup(buildPopupHtml(selectionData), {
        className: "bcm-leaflet-popup",
        pane: "popupOnTop",
      });
      marker.on("click", () => {
        selectionData.latlng = {
          lat: marker.getLatLng().lat,
          lng: marker.getLatLng().lng,
        };
        setSelection(selectionData);
      });

      const trail = new L.Polyline(directionLine, {
        color: "#ff0000ff",
        weight: 1,
        opacity: 1,
        smoothFactor: 1,
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

  async function handleResourceSelect(
    resourceId: number,
    name: string,
    tier: number,
  ): Promise<void> {
    if (resourceLayers[resourceId]) return; // already loaded

    trackedResourceIds.add(resourceId);
    updateResourceIdParam(trackedResourceIds);

    const color = loadColorPreference('resource', resourceId) || tierColors[tier] || "#3388ff";
    const canvasLayer = new ResourceCanvasLayer({ color, name, tier, id: resourceId });
    resourceLayers[resourceId] = canvasLayer;
    canvasLayer.addTo(map);

    addTrackingItem({
      id: resourceId,
      type: "resource",
      text: `Tracking: ${name}, Tier ${tier}`,
      color,
      visible: true,
    });

    try {
      const regions = regionState.effectiveRegions;
      const results = await Promise.all(
        regions.map((rId) => fetchResource(rId, resourceId)),
      );

      regions.forEach((rId, idx) => {
        const geoJson = results[idx];
        if (
          geoJson.features[0]?.geometry &&
          (geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates
            ?.length > 0
        ) {
          const coords = (geoJson.features[0].geometry as GeoJSON.MultiPoint)
            .coordinates;
          canvasLayer.setRegionPoints(rId, coords as [number, number][]);
        }
      });

      subscribeResource(resourceId);
    } catch (err) {
      console.error(`Failed to load resource ${resourceId}:`, err);
    }
  }

  async function handleCreatureSelect(
    enemyId: number,
    name: string,
    tier: number,
  ): Promise<void> {
    if (resourceLayers[enemyId]) return; // already loaded

    trackedEnemyIds.add(enemyId);
    updateEnemyIdParam(trackedEnemyIds);

    const color = loadColorPreference('enemy', enemyId) ||
      creatureIndex[enemyId]?.color || tierColors[tier] || "#3388ff";
    const canvasLayer = new ResourceCanvasLayer({ color, name, tier, id: enemyId });
    resourceLayers[enemyId] = canvasLayer;
    canvasLayer.addTo(map);

    addTrackingItem({
      id: enemyId,
      type: "enemy",
      text: `Tracking: ${name}, Tier ${tier}`,
      color,
      visible: true,
    });

    try {
      const regions = regionState.effectiveRegions;
      const results = await Promise.all(
        regions.map((rId) => fetchEnemy(rId, enemyId)),
      );

      regions.forEach((rId, idx) => {
        const geoJson = results[idx];
        if (
          geoJson.features[0]?.geometry &&
          (geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates
            ?.length > 0
        ) {
          const coords = (geoJson.features[0].geometry as GeoJSON.MultiPoint)
            .coordinates;
          canvasLayer.setRegionPoints(rId, coords as [number, number][]);
        }
      });
    } catch (err) {
      console.error(`Failed to load creature ${enemyId}:`, err);
    }
  }

  async function loadBackendData(
    urlParams: ReturnType<typeof parseUrlParams>,
    map: L.Map,
  ): Promise<void> {
    const {
      resourceId: resourceParam,
      enemyId: enemyParam,
      noColors,
    } = urlParams;

    if (!resourceParam && !enemyParam) return;

    const regionIds = regionState.effectiveRegions;

    let resourceIds: number[] = [];
    if (resourceParam) {
      if (!/^([0-9]\d*)(,([0-9]\d*))*$/.test(resourceParam)) return;
      resourceIds = [...new Set(resourceParam.split(",").map(Number))];
      for (const id of resourceIds) {
        trackedResourceIds.add(id);
      }
    }

    let enemyIds: number[] = [];
    if (enemyParam) {
      if (!/^([0-9]\d*)(,([0-9]\d*))*$/.test(enemyParam)) return;
      enemyIds = [...new Set(enemyParam.split(",").map(Number))];
    }

    const fetchPromises: Promise<GeoJSON.FeatureCollection>[] = [];
    const geoJsonMeta: {
      region: number;
      fillColor: string;
      resource: number;
    }[] = [];
    let trackingList: { text: string; color: string; id: number; type: 'resource' | 'enemy' }[] = [];

    for (const id of resourceIds) {
      let color = loadColorPreference('resource', id) ||
        resourceIndexOverride[id]?.color ||
        tierColors[resourceIndexOverride[id]?.tier] ||
        resourceIndex[id]?.color ||
        tierColors[resourceIndex[id]?.tier] ||
        "#3388ff";
      if (noColors) color = "#3388ff";
      const tier = resourceIndexOverride[id]?.tier || resourceIndex[id]?.tier || 0;
      const name = resourceIndex[id]?.name || "ID " + id;
      resourceLayers[id] = new ResourceCanvasLayer({ color, name, tier, id });
      resourceLayers[id].addTo(map);
    }
    for (const id of enemyIds) {
      let color = loadColorPreference('enemy', id) ||
        creatureIndex[id]?.color ||
        tierColors[creatureIndex[id]?.tier] ||
        "#3388ff";
      if (noColors) color = "#3388ff";
      const tier = creatureIndex[id]?.tier || 0;
      const name = creatureIndex[id]?.name || "ID " + id;
      resourceLayers[id] = new ResourceCanvasLayer({ color, name, tier, id });
      resourceLayers[id].addTo(map);
    }

    for (const rId of regionIds) {
      for (const resId of resourceIds) {
        let color = loadColorPreference('resource', resId) ||
          resourceIndexOverride[resId]?.color ||
          tierColors[resourceIndexOverride[resId]?.tier] ||
          resourceIndex[resId]?.color ||
          tierColors[resourceIndex[resId]?.tier] ||
          "#3388ff";
        if (noColors) color = "#3388ff";
        const tier =
          resourceIndexOverride[resId]?.tier || resourceIndex[resId]?.tier || 0;
        const name = resourceIndex[resId]?.name || "ID " + resId;
        geoJsonMeta.push({ region: rId, fillColor: color, resource: resId });
        fetchPromises.push(fetchResource(rId, resId));
        trackingList.push({
          text: "Tracking: " + name + ", Tier " + tier,
          color,
          id: resId,
          type: 'resource',
        });
      }
      for (const eId of enemyIds) {
        let color = loadColorPreference('enemy', eId) ||
          creatureIndex[eId]?.color ||
          tierColors[creatureIndex[eId]?.tier] ||
          "#3388ff";
        if (noColors) color = "#3388ff";
        const tier = creatureIndex[eId]?.tier || 0;
        const name = creatureIndex[eId]?.name || "ID " + eId;
        geoJsonMeta.push({ region: rId, fillColor: color, resource: eId });
        fetchPromises.push(fetchEnemy(rId, eId));
        trackingList.push({
          text: "Tracking: " + name + ", Tier " + tier,
          color,
          id: eId,
          type: 'enemy',
        });
      }
    }

    trackingList = filterUnique(trackingList);
    for (const item of trackingList) {
      addTrackingItem({
        id: item.id,
        type: item.type,
        text: item.text,
        color: noColors ? '#3388ff' : (loadColorPreference(item.type, item.id) || item.color),
        visible: true,
      });
    }

    if (fetchPromises.length === 0) return;
    const geoJsonResults = await Promise.all(fetchPromises);

    geoJsonResults.forEach((geoJson, idx) => {
      if (
        geoJson.features[0]?.geometry &&
        (geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates
          ?.length > 0
      ) {
        const meta = geoJsonMeta[idx];
        const coords = (geoJson.features[0].geometry as GeoJSON.MultiPoint)
          .coordinates;
        const canvasLayer = resourceLayers[meta.resource];
        if (canvasLayer) {
          canvasLayer.setRegionPoints(
            meta.region,
            coords as [number, number][],
          );
        }
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
    saveActiveLayers();
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

  function handleRemoveResource(id: number): void {
    const layer = resourceLayers[id];
    if (layer) {
      layer.remove();
      delete resourceLayers[id];
    }
    trackedResourceIds.delete(id);
    updateResourceIdParam(trackedResourceIds);
    cancelPendingRefetches(id);
    unsubscribeResource(id);
  }

  function handleColorChangeResource(id: number, color: string): void {
    const layer = resourceLayers[id];
    if (layer) {
      layer.setColor(color);
    }
  }

  function handleColorChangePlayer(entityId: string, color: string): void {
    const marker = playerStore.get(entityId);
    if (marker) {
      const el = marker.getElement();
      if (el) {
        const dot = el.querySelector(".player-dot") as HTMLElement;
        const pulse = el.querySelector(".player-pulse") as HTMLElement;
        if (dot) dot.style.backgroundColor = color;
        if (pulse) pulse.style.borderColor = color;
      }
    }
  }

  function handleRemovePlayer(entityId: string): void {
    // Remove markers
    const marker = playerStore.get(entityId);
    const dest = destinationStore.get(entityId);
    if (marker) liveLayer.removeLayer(marker);
    if (dest) liveLayer.removeLayer(dest);
    playerStore.delete(entityId);
    destinationStore.delete(entityId);
    playerUsernames.delete(entityId);

    // Close WebSocket
    const ws = playerWebSockets.get(entityId);
    if (ws) {
      ws.close();
      playerWebSockets.delete(entityId);
    }
    trackedPlayerIds.delete(entityId);
    updatePlayerIdParam(trackedPlayerIds);
  }

  function handleRegionsChange(): void {
    updateRegionIdParam(regionState.selected);

    const currentTrackedIds = [...trackedResourceIds];
    if (currentTrackedIds.length === 0) return;

    cancelAllPendingRefetches();

    // Clear all region data from canvas layers
    for (const id of currentTrackedIds) {
      const layer = resourceLayers[id];
      if (layer) layer.clearAllRegions();
    }

    const regions = regionState.effectiveRegions;
    for (const resourceId of currentTrackedIds) {
      Promise.all(regions.map((rId) => fetchResource(rId, resourceId)))
        .then((results) => {
          const canvasLayer = resourceLayers[resourceId];
          if (!canvasLayer) return;
          regions.forEach((rId, idx) => {
            const geoJson = results[idx];
            if (
              geoJson.features[0]?.geometry &&
              (geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates
                ?.length > 0
            ) {
              const coords = (
                geoJson.features[0].geometry as GeoJSON.MultiPoint
              ).coordinates;
              canvasLayer.setRegionPoints(rId, coords as [number, number][]);
            }
          });
        })
        .catch((err) =>
          console.error(`Failed to reload resource ${resourceId}:`, err),
        );
    }
  }

  function isLayerActive(name: string): boolean {
    return activeLayers.has(name);
  }

  function handleSearchSelect(entry: {
    latlng: L.LatLng;
    layer: L.LayerGroup;
    selectionData?: import("$lib/types/map").MapSelection;
  }): void {
    if (!map.hasLayer(entry.layer)) {
      map.addLayer(entry.layer);
      // Sync activeLayers so the sidebar checkbox reflects the change
      for (const [name, layer] of Object.entries(genericToggle)) {
        if (layer === entry.layer) {
          activeLayers.add(name);
          break;
        }
      }
      saveActiveLayers();
    }
    // Zoom in to at least 1 so the selected marker is identifiable
    const targetZoom = Math.max(map.getZoom(), 1);
    map.flyTo(entry.latlng, targetZoom);
    if (entry.selectionData) {
      setSelection(entry.selectionData);
    }
  }

  setContext("map", {
    getMap: () => map,
    toggleLayer: handleToggleLayer,
    isLayerActive,
    handleSearchSelect,
    handleToggleResourceLayer,
    genericToggle: () => genericToggle,
  });
</script>

<div class="relative h-viewport w-screen overflow-hidden bg-[#1E2742]">
  <div bind:this={mapElement} class="absolute inset-0 z-map"></div>

  {#if mapReady}
    <SearchBar
      onSelect={handleSearchSelect}
      onPlayerSelect={handlePlayerSelect}
      onResourceSelect={handleResourceSelect}
      onCreatureSelect={handleCreatureSelect}
    />
    <Sidebar
      {genericToggle}
      isActive={isLayerActive}
      onToggleLayer={handleToggleLayer}
      onToggleResource={handleToggleResourceLayer}
      onTogglePlayer={handleTogglePlayerVisibility}
      onRemoveResource={handleRemoveResource}
      onRemovePlayer={handleRemovePlayer}
      onColorChangeResource={handleColorChangeResource}
      onColorChangePlayer={handleColorChangePlayer}
      onRegionsChange={handleRegionsChange}
    />
    <DetailPanel
      onTrackResource={handleResourceSelect}
      onFollowPlayer={handlePlayerSelect}
    />
  {/if}

  <div
    class="absolute bottom-14 sm:bottom-3 left-3 z-ui flex flex-col items-start gap-2"
  >
    <GameTimers />
    <div class="flex items-center gap-2">
      <CoordinateDisplay {coords} />
      <ResetViewButton onReset={resetView} />
      {#if showHiResToggle && hiResLoaded}
        <button
          class="rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur hover:bg-black/80"
          onclick={() => {
            const isHiRes = baseMapOverlay.getElement()?.src?.includes("12800");
            baseMapOverlay.setUrl(isHiRes ? initialMapUrl : hiResUrl);
          }}
        >
          Toggle Hi-Res
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.leaflet-container) {
    background: #1e2742;
  }

  :global(.leaflet-image-layer),
  :global(.leaflet-tile-pane img) {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    will-change: transform;
    backface-visibility: hidden;
  }
</style>
