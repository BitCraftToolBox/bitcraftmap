import L from "leaflet";
import "leaflet.markercluster";
import { createIcon } from "./create-icon";
import { readableCoordinates } from "./coordinate-utils";
import { validateGeoJson } from "./geojson-validator";
import { paintGeoJson, type PaintContext } from "./geojson-painter";
import { setSelection } from "$lib/stores/selection-store.svelte";
import { buildPopupHtml } from "./popup-builder";
import { createAppConfig } from "$lib/config/api";
import type { MapSelection } from "$lib/types/map";
import { env } from "$env/dynamic/public";

function geojsonUrl(filename: string): string {
  const { exportsCdn } = createAppConfig();
  return env.PUBLIC_CDN_MAP === "true"
    ? `${exportsCdn}/${filename}`
    : `/assets/${filename}`;
}

// Static icons - created once
let caveIcons: L.Icon[];
let claimIcons: L.Icon[];
let eventIcon: L.Icon;
let ruinedIcon: L.Icon;
let templeIcon: L.Icon;
let treeIcon: L.Icon;
let towerIcon: L.Icon;
let hexiteIcon: L.Icon;
let hexiteDepletedIcon: L.Icon;

export function initIcons(): void {
  caveIcons = Array.from({ length: 10 }, (_, i) => createIcon(`t${i + 1}`));
  claimIcons = Array.from({ length: 11 }, (_, i) => createIcon(`claimT${i}`));
  eventIcon = createIcon("jack-o-lantern");
  ruinedIcon = createIcon("ruinedCity");
  templeIcon = createIcon("temple");
  treeIcon = createIcon("travelerTree");
  towerIcon = createIcon("tower", [16, 32]);
  hexiteIcon = createIcon("hexite-energy");
  hexiteDepletedIcon = createIcon("hexite-energy", [32, 32], { className: "grayscale-icon" });
}

/** Bind a lazy popup — the content function is only called when the popup opens. */
function bindLazyPopup(marker: L.Marker, selectionData: MapSelection): void {
  marker.bindPopup(() => buildPopupHtml(selectionData), {
    className: "bcm-leaflet-popup",
  });
  marker.on("click", () => setSelection(selectionData));
}

export async function loadTreesGeoJson(
  treesLayer: L.LayerGroup,
  hexiteLayer: L.LayerGroup,
): Promise<void> {
  const file = await fetch(geojsonUrl("trees.geojson"));
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    pointToLayer(feature, latlng) {
      const isHexite = feature.properties.type === "hexite";
      const targetLayer = isHexite ? hexiteLayer : treesLayer;
      const icon = isHexite ?
              !feature.properties.timer || new Date(feature.properties.timer).getTime() <= Date.now()
                  ? hexiteIcon
                  : hexiteDepletedIcon
              : treeIcon;
      const selectionType = isHexite
        ? ("hexite" as const)
        : ("wonder" as const);

      const selectionData = {
        type: selectionType,
        name: feature.properties.name,
        latlng: { lat: latlng.lat, lng: latlng.lng },
        timer: feature.properties.timer
      };
      const marker = L.marker(latlng, { icon }).addTo(targetLayer);
      bindLazyPopup(marker, selectionData);
      return marker;
    },
  });
}

export async function loadTemplesGeoJson(
  templesLayer: L.LayerGroup,
): Promise<void> {
  const file = await fetch(geojsonUrl("temples.geojson"));
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    pointToLayer(feature, latlng) {
      const selectionData = {
        type: "temple" as const,
        name: feature.properties.name,
        latlng: { lat: latlng.lat, lng: latlng.lng },
      };
      const marker = L.marker(latlng, { icon: templeIcon }).addTo(templesLayer);
      bindLazyPopup(marker, selectionData);
      return marker;
    },
  });
}

export async function loadRuinedGeoJson(
  ruinedLayer: L.LayerGroup,
): Promise<void> {
  const file = await fetch(geojsonUrl("ruined.geojson"));
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    pointToLayer(feature, latlng) {
      const coords = readableCoordinates(latlng);
      const name = feature.properties.name;
      const selectionData = {
        type: "ruined-city" as const,
        name,
        latlng: { lat: latlng.lat, lng: latlng.lng },
      };
      const marker = L.marker(latlng, {
        title: name + " N " + coords[0] + " E " + coords[1],
        icon: ruinedIcon,
      }).addTo(ruinedLayer);
      (marker as any)._selectionData = selectionData;
      bindLazyPopup(marker, selectionData);
      return marker;
    },
  });
}

export async function loadClaimsGeoJson(
  claimLayers: L.LayerGroup[],
  banksLayer: L.LayerGroup,
  marketsLayer: L.LayerGroup,
  waystonesLayer: L.LayerGroup,
): Promise<void> {
  const file = await fetch(geojsonUrl("claims.geojson"));
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    pointToLayer(feature, latlng) {
      const coords = readableCoordinates(latlng);
      const selectionData = {
        type: "claim" as const,
        name: feature.properties.name,
        entityId: feature.properties.entityId,
        tier: feature.properties.tier,
        latlng: { lat: latlng.lat, lng: latlng.lng },
        hasBank: !!feature.properties.has_bank,
        hasMarket: !!feature.properties.has_market,
        hasWaystone: !!feature.properties.has_waystone,
      };
      const marker = L.marker(latlng, {
        title: feature.properties.name + " N " + coords[0] + " E " + coords[1],
        icon: claimIcons[feature.properties.tier],
        zIndexOffset: feature.properties.tier * 10,
      });
      (marker as any)._selectionData = selectionData;
      bindLazyPopup(marker, selectionData);

      marker.addTo(claimLayers[feature.properties.tier]);

      // Create independent markers for POI layers so toggling them
      // doesn't remove the shared marker from the claims layer.
      if (feature.properties.has_bank) {
        const m = L.marker(latlng, { icon: claimIcons[feature.properties.tier], zIndexOffset: feature.properties.tier * 10 });
        bindLazyPopup(m, selectionData);
        m.addTo(banksLayer);
      }
      if (feature.properties.has_market) {
        const m = L.marker(latlng, { icon: claimIcons[feature.properties.tier], zIndexOffset: feature.properties.tier * 10 });
        bindLazyPopup(m, selectionData);
        m.addTo(marketsLayer);
      }
      if (feature.properties.has_waystone) {
        const m = L.marker(latlng, { icon: claimIcons[feature.properties.tier], zIndexOffset: feature.properties.tier * 10 });
        bindLazyPopup(m, selectionData);
        m.addTo(waystonesLayer);
      }

      return marker;
    },
  });
}

export async function loadCavesGeoJson(
  caveLayers: L.LayerGroup[],
): Promise<void> {
  const file = await fetch(geojsonUrl("caves.geojson"));
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    pointToLayer(feature, latlng) {
      const selectionData = {
        type: "cave" as const,
        name: feature.properties.name,
        latlng: { lat: latlng.lat, lng: latlng.lng },
        tier: feature.properties.tier,
      };
      const marker = L.marker(latlng, {
        icon: caveIcons[feature.properties.tier - 1],
      }).addTo(caveLayers[feature.properties.tier - 1]);
      bindLazyPopup(marker, selectionData);
      return marker;
    },
  });
}

export async function loadEventsGeoJson(
  eventsLayer: L.LayerGroup,
  ctx: PaintContext,
): Promise<void> {
  const file = await fetch(geojsonUrl("events.geojson"));
  const content = await file.text();
  const geoJson = validateGeoJson(content);
  paintGeoJson(geoJson, eventsLayer, ctx);
}

export async function loadDungeonsGeoJson(
  dungeonsLayer: L.LayerGroup,
): Promise<void> {
  const file = await fetch(geojsonUrl("dungeons.geojson"));
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    pointToLayer(feature, latlng) {
      const icon = feature.properties.iconName
        ? createIcon(feature.properties.iconName, feature.properties.iconSize)
        : createIcon("dungeon", [35, 35]);
      const selectionData = {
        type: "dungeon" as const,
        name: feature.properties.popupText ?? "Dungeon",
        latlng: { lat: latlng.lat, lng: latlng.lng },
      };
      const marker = L.marker(latlng, { icon }).addTo(dungeonsLayer);
      bindLazyPopup(marker, selectionData);
      return marker;
    },
  });
}

export async function loadGridsGeoJson(
  gridsLayer: L.LayerGroup,
  ctx: PaintContext,
): Promise<void> {
  const file = await fetch(geojsonUrl("grids.geojson"));
  const content = await file.text();
  const geoJson = validateGeoJson(content);
  paintGeoJson(geoJson, gridsLayer, ctx);
}

function buildWatchtowerSelection(
  properties: Record<string, any>,
  latlng: { lat: number; lng: number },
) {
  return {
    type: "watchtower" as const,
    towerEntityId: properties.towerEntityId,
    name: properties.name ?? "Watchtower",
    owner: properties.owner ?? "Unknown",
    ownerId: properties.ownerId,
    latlng,
    chunkCount: properties.chunkCount,
    fillColor: properties.fillColor,
    outlineColor: properties.outlineColor,
  };
}

function buildTowerPolygonStyle(
  feature: GeoJSON.Feature,
  highlighted: boolean,
): L.PathOptions {
  const props = (feature.properties ?? {}) as Record<string, any>;
  const featureKind = props.featureKind;
  const baseWeight = props.weight ?? 1;
  const baseFillOpacity = props.fillOpacity ?? 0.2;

  if (featureKind === "tower-chunks") {
    return {
      color: props.color ?? "#7f7f7f",
      weight: highlighted ? Math.max(baseWeight, 1) : baseWeight,
      opacity: highlighted ? 0.9 : 0.25,
      fillColor: props.fillColor,
      fillOpacity: highlighted ? 0.28 : baseFillOpacity,
    };
  }

  if (featureKind === "tower-outline") {
    return {
      color: props.color ?? "#000000",
      weight: highlighted ? Math.max(baseWeight, 2) : baseWeight,
      opacity: highlighted ? 1 : 0.85,
      fillColor: props.fillColor,
      fillOpacity: highlighted ? 0.78 : baseFillOpacity,
    };
  }

  return {
    color: props.color ?? "#000000",
    weight: baseWeight,
    fillColor: props.fillColor,
    fillOpacity: baseFillOpacity,
  };
}

export async function loadTowersGeoJson(
  towersLayer: L.LayerGroup,
  territoriesLayer: L.LayerGroup,
  map: L.Map,
): Promise<void> {
  const file = await fetch(geojsonUrl("towers.geojson"));
  const geojsonData = await file.json();
  const allFeatures = Array.isArray(geojsonData?.features) ? geojsonData.features : [];
  const markerFeatures = allFeatures.filter(
    (feature: GeoJSON.Feature) => feature?.geometry?.type === "Point",
  );
  const polygonFeatures = allFeatures.filter(
    (feature: GeoJSON.Feature) => feature?.geometry?.type === "MultiPolygon",
  );

  const markerFeatureCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: markerFeatures,
  };

  const polygonFeatureCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: polygonFeatures,
  };

  const towerPolygonsByEntityId = new Map<string, L.Path[]>();
  let highlightedTowerEntityId: string | null = null;

  function registerTowerPolygon(feature: GeoJSON.Feature, layer: L.Layer): void {
    if (feature.geometry.type !== "MultiPolygon") return;
    const towerEntityId = String((feature.properties as any)?.towerEntityId ?? "");
    if (!towerEntityId || !(layer instanceof L.Path)) return;
    if (!towerPolygonsByEntityId.has(towerEntityId)) {
      towerPolygonsByEntityId.set(towerEntityId, []);
    }
    towerPolygonsByEntityId.get(towerEntityId)!.push(layer);
  }

  function highlightTowerTerritories(towerEntityId: string | null): void {
    highlightedTowerEntityId = towerEntityId;
    for (const [entityId, layers] of towerPolygonsByEntityId.entries()) {
      const shouldHighlight = !!towerEntityId && entityId === towerEntityId;
      for (const layer of layers) {
        const feature = (layer as any).feature as GeoJSON.Feature | undefined;
        if (!feature) continue;
        layer.setStyle(buildTowerPolygonStyle(feature, shouldHighlight));
        if (shouldHighlight) {
          layer.bringToFront();
        }
      }
    }
  }

  L.geoJSON(polygonFeatureCollection, {
    style(feature) {
      if (feature?.geometry.type === "MultiPolygon") {
        const towerEntityId = String(feature.properties?.towerEntityId ?? "");
        const isHighlighted =
          !!highlightedTowerEntityId && towerEntityId === highlightedTowerEntityId;
        return buildTowerPolygonStyle(feature, isHighlighted);
      }
      return {};
    },
    onEachFeature(feature, featureLayer) {
      registerTowerPolygon(feature, featureLayer);
      if (
        feature.geometry.type === "MultiPolygon" &&
        feature.properties.pointCoords
      ) {
        featureLayer.on("click", () => {
          const coords = feature.properties.pointCoords;
          if (coords) {
            const selectionData = buildWatchtowerSelection(feature.properties, {
              lat: coords[0],
              lng: coords[1],
            });
            if (highlightedTowerEntityId === selectionData.towerEntityId) {
              highlightTowerTerritories(null);
            } else {
              setSelection(selectionData);
              highlightTowerTerritories(selectionData.towerEntityId);
              L.popup({className: "bcm-leaflet-popup", pane: "popupOnTop"})
                  .setLatLng(coords)
                  .setContent(buildPopupHtml(selectionData))
                  .openOn(map);
            }
          }
        });
      }
    },
  }).addTo(territoriesLayer);

  L.geoJSON(markerFeatureCollection, {
    pointToLayer(feature, latlng) {
      const selectionData = buildWatchtowerSelection(feature.properties, {
        lat: latlng.lat,
        lng: latlng.lng,
      });
      const marker = L.marker(latlng, { icon: towerIcon });
      bindLazyPopup(marker, selectionData);
      marker.on("click", () => {
        highlightTowerTerritories(selectionData.towerEntityId);
      });
      return marker;
    },
  }).addTo(towersLayer);
}

export function loadGeoJsonFromHash(
  waypointsLayer: L.LayerGroup,
  ctx: PaintContext,
  map: L.Map,
): void {
  const hashFromUrl = location.hash.slice(1);
  if (!hashFromUrl) return;
  const geoJson = validateGeoJson(hashFromUrl);
  paintGeoJson(geoJson, waypointsLayer, ctx);
  map.addLayer(waypointsLayer);
}
