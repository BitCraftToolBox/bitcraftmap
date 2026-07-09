<script lang="ts">
  import {env} from "$env/dynamic/public";
  import DetailPanel from "$lib/components/detail/DetailPanel.svelte";
  import SearchBar from "$lib/components/search/SearchBar.svelte";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import {createAppConfig} from "$lib/config/api";
  import {createMapConfig} from "$lib/config/map";
  import {tierColors} from "$lib/config/tiers";
  import {creatureIndex, resourceIndex, resourceIndexOverride,} from "$lib/data/resource-index";
  import {formatCoordinates,} from "$lib/map/coordinate-utils";
  import {setupDefaultIcon} from "$lib/map/create-icon";
  import {
    initIcons,
    loadCavesGeoJson,
    loadClaimsGeoJson,
    loadDungeonsGeoJson,
    loadEmpireResourcesGeoJson,
    loadEventsGeoJson,
    loadGeoJsonFromHash,
    loadGridsGeoJson,
    loadNpcsGeoJson,
    loadTemplesGeoJson,
    loadTowersGeoJson,
    loadTreesGeoJson,
    loadUnchartedGeoJson,
  } from "$lib/map/geojson-loader";
  import {type PaintContext, paintGeoJson} from "$lib/map/geojson-painter";
  import {validateGeoJson} from "$lib/map/geojson-validator";
  import {buildPopupHtml} from "$lib/map/popup-builder";
  import {ResourceCanvasLayer} from "$lib/map/resource-canvas-layer";
  import {getLatestGistRaw} from "$lib/services/gist-service";
  import {destroyRelayService, initRelayService, trackEntity, trackPlayer, untrackEntity, untrackPlayer, updateAllEntityRegions,} from "$lib/services/relay-service";
  import {hashHasFlyToOrZoom, resetView, restoreMapState, saveMapState, setMap,} from "$lib/stores/map-store";
  import {getRegionState, setRegions} from "$lib/stores/region-store.svelte";
  import {addLayerEntries, addSearchEntries,} from "$lib/stores/search-store.svelte";
  import {setSelection} from "$lib/stores/selection-store.svelte";
  import {getLodEnabled} from "$lib/stores/settings-store.svelte";
  import {addTrackingItem, loadColorPreference, loadFavorites, registerColorSyncHandler,} from "$lib/stores/tracking-store.svelte";
  import {filterUnique} from "$lib/utils/dedupe";
  import {buildChatCoordinateLink, buildCoordinateViewUrl} from "$lib/utils/coordinate-links";
  import {parseUrlParams, updateEnemyIdParam, updatePlayerIdParam, updateRegionIdParam, updateResourceIdParam,} from "$lib/utils/url-params";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import "leaflet.markercluster";
  import {onMount, setContext} from "svelte";
  import {SvelteSet} from "svelte/reactivity";
  import CoordinateDisplay from "./CoordinateDisplay.svelte";
  import GameTimers from "./GameTimers.svelte";
  import ResetViewButton from "./ResetViewButton.svelte";

  function showPopupCopyFeedback(btn: HTMLElement): void {
    const originalIcon = btn.dataset.icon ?? btn.textContent ?? "";
    btn.classList.add("is-copied");
    btn.textContent = "✓";
    btn.title = "Copied!";
    window.setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.textContent = originalIcon;
      const action = btn.dataset.action;
      btn.title = action === "copy-chat-coords"
        ? "Copy in-game chat link to coordinates"
        : "Copy website link to coordinates";
    }, 1200);
  }

  let mapElement: HTMLDivElement;
  let map = $state<L.Map>(undefined!);
  let mapReady = $state(false);
  let coords = $state("N: 0 E: 0");
  const regionState = getRegionState();

  let terrainTileLayer: L.TileLayer | undefined;
  let gameTileLayer: L.TileLayer | undefined;

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
  let territoriesLayer: L.LayerGroup;
  let hexiteLayer: L.LayerGroup;
  let makersTreeLayer: L.LayerGroup;
  let geysersLayer: L.LayerGroup;
  let hermitCrabDensLayer: L.LayerGroup;
  let shipwrecksLayer: L.LayerGroup;
  let unchartedRuinsLayer: L.LayerGroup;
  let silkmothLayer: L.LayerGroup;
  let travelerCampLayer: L.LayerGroup;
  let waypointsLayer: L.LayerGroup;
  let roadsLayer: L.LayerGroup;
  let claimLayers: L.LayerGroup[];
  let caveLayers: L.LayerGroup[];
  let allClaims: L.LayerGroup;
  let allCaves: L.LayerGroup;
  let resourceLayers: Record<number, ResourceCanvasLayer> = {};
  let enemyLayers: Record<number, ResourceCanvasLayer> = {};
  let liveLayer: L.FeatureGroup;

  // Toggle mapping for layer panel
  let genericToggle = $state<Record<string, L.LayerGroup>>({});
  let activeLayers = new SvelteSet<string>();
  let allLayers: Record<string, L.LayerGroup> = {};
  let activeBaseLayer = $state<"terrain" | "game">("terrain");

  const LAYERS_STORAGE_KEY = "activeLayers";
  const DEFAULT_LAYERS = ["Events", "Wonders", "Temples", "Ruined Cities"];

  const BASELAYER_STORAGE_KEY = "activeBaseLayer";

  // Base layer state
  function loadBaseLayerPreference(): "terrain" | "game" {
    try {
      const stored = localStorage.getItem(BASELAYER_STORAGE_KEY);
      return stored === "game" ? "game" : "terrain";
    } catch {
      return "terrain";
    }
  }

  function saveBaseLayerPreference(layer: "terrain" | "game"): void {
    try {
      localStorage.setItem(BASELAYER_STORAGE_KEY, layer);
    } catch {
      /* ignore */
    }
  }

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

  // Propagate LOD setting to all resource layers whenever it changes
  $effect(() => {
    const enabled = getLodEnabled();
    for (const layer of Object.values(resourceLayers)) {
      layer.setLodEnabled(enabled);
    }
  });

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

    // Helper to create a tile layer for a given style
    const terrainBounds = L.latLngBounds([
      [0, 0],
      [mapConfig.mapHeight, mapConfig.mapWidth],
    ]);

    function createTileLayer(dir: string, style: string): L.TileLayer {
      const tileLayer = L.tileLayer(
        `${appConfig.exportsCdn}/${dir}${style ? "/" + style : ""}/tiles/{z}/{x}/{y}.webp`,
        {
          bounds: terrainBounds,
          minZoom: -5,
          maxZoom: 5,
          minNativeZoom: -5,
          maxNativeZoom: 0,
          tileSize: 256,
          keepBuffer: 4,
          updateWhenZooming: false,
          errorTileUrl: "",
          pane: "baseMapPane",
        },
      );
      (tileLayer as any)._isValidTile = function (coords: {
        x: number;
        y: number;
        z: number;
      }) {
        const tileBounds = (this as any)._tileCoordsToBounds(coords);
        return terrainBounds.overlaps(tileBounds);
      };
      return tileLayer;
    }

    // Base layer initialization
    activeBaseLayer = loadBaseLayerPreference();

    // Create base layers
    if (env.PUBLIC_CDN_MAP === 'true') {
      terrainTileLayer = createTileLayer("maps", "terrain");
      gameTileLayer = createTileLayer("maps", "game");

      // Add the active base layer to the map
      if (activeBaseLayer === "terrain") {
        terrainTileLayer.addTo(map);
      } else {
        gameTileLayer.addTo(map);
      }
    } else {
      L.imageOverlay('/assets/maps/map.webp', terrainBounds, {
        pane: 'baseMapPane',
      }).addTo(map);
    }
    map.fitBounds([
      [0, 0],
      [mapConfig.mapWidth, mapConfig.mapHeight],
    ]);
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
    territoriesLayer = L.layerGroup();
    hexiteLayer = L.layerGroup();
    makersTreeLayer = L.layerGroup();
    geysersLayer = L.layerGroup();
    hermitCrabDensLayer = L.layerGroup();
    shipwrecksLayer = L.layerGroup();
    unchartedRuinsLayer = L.layerGroup();
    silkmothLayer = L.layerGroup();
    travelerCampLayer = L.layerGroup();
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

    roadsLayer = L.layerGroup([createTileLayer("roads", "")]);

    // Live tracking layer
    liveLayer = L.featureGroup().addTo(map);

    // Build toggle and allLayers maps
    genericToggle = {
      Events: eventsLayer,
      Wonders: treesLayer,
      "Hexite Deposits": hexiteLayer,
      "Maker's Trees": makersTreeLayer,
      Temples: templesLayer,
      "Ruined Cities": ruinedLayer,
      "Traveler Camps": travelerCampLayer,
      "Volcanic Geysers": geysersLayer,
      "Hermit Crab Dens": hermitCrabDensLayer,
      Shipwrecks: shipwrecksLayer,
      "Uncharted Ruins": unchartedRuinsLayer,
      "Silkmoth Breeding Grounds": silkmothLayer,
      Banks: banksLayer,
      Markets: marketsLayer,
      Waystones: waystonesLayer,
      Grids: gridsLayer,
      Dungeons: dungeonsLayer,
      Territories: territoriesLayer,
      Watchtowers: towersLayer,
      "Custom Waypoints": waypointsLayer,
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

    addLayerEntries(Object.entries(genericToggle).map(([t, l]) => { return {title: t, layer: l, type: 'layer' as const};}));

    allLayers = {
      eventsLayer,
      treesLayer,
      hexiteLayer,
      makersTreeLayer,
      geysersLayer,
      hermitCrabDensLayer,
      shipwrecksLayer,
      unchartedRuinsLayer,
      silkmothLayer,
      travelerCampLayer,
      templesLayer,
      ruinedLayer,
      banksLayer,
      marketsLayer,
      waystonesLayer,
      waypointsLayer,
      dungeonsLayer,
      territoriesLayer,
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

    function handlePopupClick(ev: MouseEvent) {
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
        if (entityId) {
          if (followingPlayerId == entityId) {
            followingPlayerId = null;
          } else {
            followingPlayerId = entityId;
            const existing = playerStore.get(entityId);
            if (existing) { // should always be true if we just clicked follow on their marker
              map.flyTo(existing.getLatLng(), map.getZoom());
            }
          }
        }
        map.closePopup();
      } else if (action === "copy-view-coords") {
        const n = Number(btn.dataset.n);
        const e = Number(btn.dataset.e);
        const z = Number(btn.dataset.z);
        if (!Number.isFinite(n) || !Number.isFinite(e) || !Number.isFinite(z) || !navigator.clipboard) return;
        navigator.clipboard
          .writeText(buildCoordinateViewUrl({n, e, z}))
          .then(() => showPopupCopyFeedback(btn));
      } else if (action === "copy-chat-coords") {
        const n = Number(btn.dataset.n);
        const e = Number(btn.dataset.e);
        if (!Number.isFinite(n) || !Number.isFinite(e) || !navigator.clipboard) return;
        navigator.clipboard
          .writeText(buildChatCoordinateLink({n, e}))
          .then(() => showPopupCopyFeedback(btn));
      }
    }

    // Handle action buttons inside Leaflet popups
    map.on("popupopen", (e: L.PopupEvent) => {
      const container = e.popup.getElement();
      if (!container) return;
      container.addEventListener("click", handlePopupClick);
    });

    // Map state persistence
    map.on("moveend", () => saveMapState(map));

    // Load GeoJSON data
    loadTreesGeoJson(treesLayer);
    loadEmpireResourcesGeoJson(hexiteLayer, makersTreeLayer);
    loadTemplesGeoJson(templesLayer);
    loadNpcsGeoJson(ruinedLayer, travelerCampLayer).then(() => {
      // Add search entries for NPC claims (ruined cities + traveler camps)
      for (const npcLayer of [ruinedLayer, travelerCampLayer]) {
        npcLayer.eachLayer((l) => {
          const marker = l as L.Marker;
          if (marker.options?.title) {
            addSearchEntries([
              {
                title: marker.options.title,
                latlng: marker.getLatLng(),
                layer: npcLayer,
                marker,
                selectionData: (marker as any)._selectionData,
              },
            ]);
          }
        });
      }
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
    loadEventsGeoJson(eventsLayer);
    loadUnchartedGeoJson(
      geysersLayer,
      hermitCrabDensLayer,
      shipwrecksLayer,
      unchartedRuinsLayer,
      silkmothLayer
    );
    loadDungeonsGeoJson(dungeonsLayer);

    loadGridsGeoJson(gridsLayer, paintCtx);
    loadTowersGeoJson(towersLayer, territoriesLayer, map);

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

    // Initialise SpacetimeDB relay connection for entity (resource/enemy) tracking
    initRelayService(appConfig, () => resourceLayers, () => enemyLayers, [...regionState.selected]);

    // Load URL-backed tracking first, then apply persisted favorites.
    (async () => {
      await loadBackendData(urlParams, map);

      if (urlParams.playerId) {
        const playerIds = urlParams.playerId
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
        let first = true;
        for (const id of playerIds) {
          if (first && urlParams.followPlayer) {
            first = false;
            followingPlayerId = id;
          }
          addTrackedPlayer(id, loadColorPreference('player', id) || "#00ff00", false);
        }
      }

      await loadFavoriteTracking(urlParams.noColors);
    })().catch(console.error);

    // Restore map state
    if (urlParams.center) {
      const [n, e] = urlParams.center;
      const zoom = Math.min(Math.max(urlParams.zoom ?? map.getZoom(), map.getMinZoom()), map.getMaxZoom());
      map.flyTo([n * 3, e * 3], zoom);
    } else if (!hashHasFlyToOrZoom()) {
      restoreMapState(map);
    }

    mapReady = true;

    const unregisterColorSync = registerColorSyncHandler((type, id, color) => {
      if (type === 'player') {
        const marker = playerStore.get(id as string);
        if (marker) {
          const el = marker.getElement();
          if (el) {
            const dot = el.querySelector(".player-dot") as HTMLElement;
            const pulse = el.querySelector(".player-pulse") as HTMLElement;
            if (dot) dot.style.backgroundColor = color;
            if (pulse) pulse.style.borderColor = color;
          }
        }
      } else {
        const layer = resourceLayers[id as number];
        if (layer) layer.setColor(color);
      }
    });

    return () => {
      unregisterColorSync();
      destroyRelayService();
      map.remove();
    };
  });

  // Resource/enemy tracking state
  const trackedResourceIds = new Set<number>();
  const trackedEnemyIds = new Set<number>();


  // Player tracking state
  const playerStore = new Map<string, L.Marker>();
  // Mutable selection data kept per player so the click handler always has current values.
  const playerSelectionDataStore = new Map<string, any>();
  const trackedPlayerIds = new Set<string>();
  let followingPlayerId = $state<string | null>(null);

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

  function addTrackedPlayer(entityId: string, color: string, updateUrl: boolean): void {
    if (trackedPlayerIds.has(entityId)) return;
    trackedPlayerIds.add(entityId);
    if (updateUrl) updatePlayerIdParam(trackedPlayerIds);
    _subscribePlayer(entityId, color);
  }

  async function handlePlayerSelect(
    entityId: string,
    username: string,
  ): Promise<void> {
    if (trackedPlayerIds.has(entityId)) return;

    const paletteColor =
      playerColorPalette[playerColorIndex % playerColorPalette.length];
    playerColorIndex++;
    const color = loadColorPreference('player', entityId) || paletteColor;

    addTrackedPlayer(entityId, color, true);
  }

  /**
   * Subscribe a player to the relay and wire up the update callback.
   * Adds a tracking item on first data, then calls updatePlayerMarker on
   * every subsequent state/location change.
   */
  function _subscribePlayer(entityId: string, color: string): void {
    let trackingItemAdded = false;

    trackPlayer(entityId, (id, name, online, x, z) => {
      if (!trackingItemAdded) {
        trackingItemAdded = true;
        addTrackingItem({
          id: -1,
          entityId: id,
          type: "player",
          text: `Player: ${name}`,
          color,
          visible: true,
        });
      }
      if (x !== null && z !== null) {
        updatePlayerMarker(id, name, online, x, z, followingPlayerId === id, color);
      }
    });
  }

  function handleTogglePlayerVisibility(entityId: string): void {
    const marker = playerStore.get(entityId);
    if (marker) {
      if (liveLayer.hasLayer(marker)) {
        liveLayer.removeLayer(marker);
      } else {
        liveLayer.addLayer(marker);
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
    entityId: string,
    name: string,
    online: boolean,
    x: number,
    z: number,
    followPlayer: boolean,
    color = "#00ff00",
  ): void {
    const playerLatLng = L.latLng(z, x);
    const existingMarker = playerStore.get(entityId);

    if (!existingMarker) {
      const icon = createPlayerIcon(color);
      const marker = L.marker(playerLatLng, {
        icon,
        pane: "markerOnTop",
      }).addTo(liveLayer);
      const selectionData = {
        type: "player" as const,
        name,
        entityId,
        username: name,
        signedIn: online,
        latlng: { lat: playerLatLng.lat, lng: playerLatLng.lng },
        color,
        isFollowing: followingPlayerId == entityId,
      };
      playerSelectionDataStore.set(entityId, selectionData);
      marker.bindPopup(buildPopupHtml(selectionData, map.getZoom()), {
        className: "bcm-leaflet-popup",
        pane: "popupOnTop",
      });
      marker.on("click", () => {
        selectionData.latlng = {
          lat: marker.getLatLng().lat,
          lng: marker.getLatLng().lng,
        };
        selectionData.isFollowing = followingPlayerId == entityId;
        setSelection(selectionData);
        marker.setPopupContent(buildPopupHtml(selectionData, map.getZoom()));
      });

      playerStore.set(entityId, marker);
    } else {
      existingMarker.setLatLng(playerLatLng);
      // Keep selectionData in sync for clicks after state changes
      const selectionData = playerSelectionDataStore.get(entityId);
      if (selectionData) {
        selectionData.name = name;
        selectionData.username = name;
        selectionData.signedIn = online;
      }
    }

    if (followPlayer) {
      // use setView here instead of flyTo to workaround https://github.com/Leaflet/Leaflet/issues/9438
      map.setView(playerLatLng, map.getZoom());
    }
  }

  async function handleResourceSelect(
    resourceId: number,
    name: string,
    tier: number,
    options: { updateUrl?: boolean } = {},
  ): Promise<void> {
    if (resourceLayers[resourceId]) return; // already loaded

    trackedResourceIds.add(resourceId);
    if (options.updateUrl !== false) updateResourceIdParam(trackedResourceIds);

    const color = loadColorPreference('resource', resourceId) || tierColors[tier] || "#3388ff";
    const canvasLayer = new ResourceCanvasLayer({ color, name, tier, id: resourceId });
    resourceLayers[resourceId] = canvasLayer;
    canvasLayer.addTo(map);
    canvasLayer.setLodEnabled(getLodEnabled());

    addTrackingItem({
      id: resourceId,
      type: "resource",
      text: `Tracking: ${name}, Tier ${tier}`,
      color,
      visible: true,
    });

    // Subscribe via SpacetimeDB relay; initial data arrives via onApplied callback.
    trackEntity(resourceId, 'resource');
  }

  async function handleCreatureSelect(
    enemyId: number,
    name: string,
    tier: number,
    options: { updateUrl?: boolean } = {},
  ): Promise<void> {
    if (enemyLayers[enemyId]) return; // already loaded

    trackedEnemyIds.add(enemyId);
    if (options.updateUrl !== false) updateEnemyIdParam(trackedEnemyIds);

    const color = loadColorPreference('enemy', enemyId) ||
      creatureIndex[enemyId]?.color || tierColors[tier] || "#3388ff";
    const canvasLayer = new ResourceCanvasLayer({ color, name, tier, id: enemyId });
    enemyLayers[enemyId] = canvasLayer;
    canvasLayer.addTo(map);
    canvasLayer.setLodEnabled(getLodEnabled());

    addTrackingItem({
      id: enemyId,
      type: "enemy",
      text: `Tracking: ${name}, Tier ${tier}`,
      color,
      visible: true,
    });

    // Subscribe via SpacetimeDB relay; initial data arrives via onApplied callback.
    trackEntity(enemyId, 'enemy');
  }

  async function loadFavoriteTracking(noColors: boolean): Promise<void> {
    const favorites = loadFavorites();
    for (const favorite of favorites) {
      if (favorite.type === 'player') {
        const entityId = String(favorite.id);
        addTrackedPlayer(entityId, noColors ? '#3388ff' : (loadColorPreference('player', entityId) || '#00ff00'), false);
        continue;
      }

      const id = Number(favorite.id);
      if (!Number.isFinite(id)) continue;
      if (favorite.type === 'resource') {
        const name = resourceIndex[id]?.name || `ID ${id}`;
        const tier = resourceIndexOverride[id]?.tier || resourceIndex[id]?.tier || 0;
        await handleResourceSelect(id, name, tier, { updateUrl: false });
      } else {
        const name = creatureIndex[id]?.name || `ID ${id}`;
        const tier = creatureIndex[id]?.tier || 0;
        await handleCreatureSelect(id, name, tier, { updateUrl: false });
      }
    }
  }

  async function loadBackendData(
    urlParams: ReturnType<typeof parseUrlParams>,
    map: L.Map,
  ): Promise<void> {
    const { resourceId: resourceParam, enemyId: enemyParam, noColors } = urlParams;

    const parseIdList = (value: string | null): number[] | null => {
      if (!value) return [];
      if (!/^([0-9]\d*)(,([0-9]\d*))*$/.test(value)) return null;
      return [...new Set(value.split(',').map(Number))];
    };

    const resourceIds = parseIdList(resourceParam);
    const enemyIds = parseIdList(enemyParam);
    if (resourceIds === null || enemyIds === null) return;
    if (resourceIds.length === 0 && enemyIds.length === 0) return;

    type TrackedType = 'resource' | 'enemy';
    type TrackingDescriptor = { text: string; color: string; id: number; type: TrackedType };

    const loadByType = (
      type: TrackedType,
      ids: number[],
      trackedIds: Set<number>,
      targetLayers: Record<number, ResourceCanvasLayer>,
    ): TrackingDescriptor[] => {
      const list: TrackingDescriptor[] = [];
      for (const id of ids) {
        trackedIds.add(id);
        const tier = type === 'resource'
          ? (resourceIndexOverride[id]?.tier || resourceIndex[id]?.tier || 0)
          : (creatureIndex[id]?.tier || 0);
        const name = type === 'resource'
          ? (resourceIndex[id]?.name || `ID ${id}`)
          : (creatureIndex[id]?.name || `ID ${id}`);
        let color = type === 'resource'
          ? (loadColorPreference('resource', id) ||
            resourceIndexOverride[id]?.color ||
            tierColors[resourceIndexOverride[id]?.tier] ||
            resourceIndex[id]?.color ||
            tierColors[resourceIndex[id]?.tier] ||
            '#3388ff')
          : (loadColorPreference('enemy', id) ||
            creatureIndex[id]?.color ||
            tierColors[creatureIndex[id]?.tier] ||
            '#3388ff');
        if (noColors) color = '#3388ff';

        targetLayers[id] = new ResourceCanvasLayer({ color, name, tier, id });
        targetLayers[id].addTo(map);
        targetLayers[id].setLodEnabled(getLodEnabled());
        list.push({ text: `Tracking: ${name}, Tier ${tier}`, color, id, type });
      }
      return list;
    };

    let trackingList = [
      ...loadByType('resource', resourceIds, trackedResourceIds, resourceLayers),
      ...loadByType('enemy', enemyIds, trackedEnemyIds, enemyLayers),
    ];

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

    for (const id of resourceIds) trackEntity(id, 'resource');
    for (const id of enemyIds) trackEntity(id, 'enemy');
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

  function handleToggleResourceLayer(id: number, type: 'enemy' | 'resource'): void {
    const layer = type === 'resource' ? resourceLayers[id] : enemyLayers[id];
    if (!layer || !map) return;
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    } else {
      map.addLayer(layer);
    }
  }

  function handleRemoveResource(id: number, type: 'enemy' | 'resource'): void {
    const layer = type === 'resource' ? resourceLayers[id] : enemyLayers[id];
    if (layer) {
      layer.remove();
      if (type === 'resource') {
        delete resourceLayers[id];
      } else {
        delete enemyLayers[id];
      }
    }
    if (type === 'resource' && trackedResourceIds.has(id)) {
      trackedResourceIds.delete(id);
      updateResourceIdParam(trackedResourceIds);
    } else if (type === 'enemy' && trackedEnemyIds.has(id)) {
      trackedEnemyIds.delete(id);
      updateEnemyIdParam(trackedEnemyIds);
    }
    untrackEntity(id, type);
  }

  function handleRemovePlayer(entityId: string): void {
    const marker = playerStore.get(entityId);
    if (marker) liveLayer.removeLayer(marker);
    playerStore.delete(entityId);
    playerSelectionDataStore.delete(entityId);
    untrackPlayer(entityId);
    trackedPlayerIds.delete(entityId);
    updatePlayerIdParam(trackedPlayerIds);
  }

  function handleRegionsChange(): void {
    updateRegionIdParam(regionState.selected);
    // Delegate to the relay service: it will create new subscriptions with the
    // updated region filter and drop the old ones after the server delta arrives.
    updateAllEntityRegions([...regionState.selected]);
  }

  function isLayerActive(name: string): boolean {
    return activeLayers.has(name);
  }

  function handleBaseLayerChange(layer: "terrain" | "game"): void {
    if (!terrainTileLayer || !gameTileLayer) return;
    activeBaseLayer = layer;
    saveBaseLayerPreference(layer);

    if (layer === "terrain") {
      map.removeLayer(gameTileLayer);
      map.addLayer(terrainTileLayer);
    } else {
      map.removeLayer(terrainTileLayer);
      map.addLayer(gameTileLayer);
    }
  }

  function handleSearchSelect(entry: {
    latlng?: L.LatLng;
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
    if (entry.latlng) {
      // Zoom in to at least 1 so the selected marker is identifiable
      const targetZoom = Math.max(map.getZoom(), 1);
      map.flyTo(entry.latlng, targetZoom);
    }
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
      getBaseLayer={() => activeBaseLayer}
      onSetBaseLayer={handleBaseLayerChange}
      onToggleResource={handleToggleResourceLayer}
      onTogglePlayer={handleTogglePlayerVisibility}
      onRemoveResource={handleRemoveResource}
      onRemovePlayer={handleRemovePlayer}
      onRegionsChange={handleRegionsChange}
    />
    <DetailPanel
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
