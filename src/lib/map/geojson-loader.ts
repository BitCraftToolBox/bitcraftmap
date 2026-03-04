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
  const file = await fetch("/markers/trees.geojson");
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
  const file = await fetch("/markers/temples.geojson");
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
  const file = await fetch("/markers/ruined.geojson");
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
  const { exportsCdn } = createAppConfig();
  const file = await fetch(
    `${exportsCdn}/bitcraftmap/claims.geojson`,
  );
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
  const file = await fetch("/markers/caves.geojson");
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
  const file = await fetch("/markers/events.geojson");
  const content = await file.text();
  const geoJson = validateGeoJson(content);
  paintGeoJson(geoJson, eventsLayer, ctx);
}

export async function loadDungeonsGeoJson(
  dungeonsLayer: L.LayerGroup,
): Promise<void> {
  const file = await fetch("/markers/dungeons.geojson");
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
  const file = await fetch("/markers/grids.geojson");
  const content = await file.text();
  const geoJson = validateGeoJson(content);
  paintGeoJson(geoJson, gridsLayer, ctx);
}

export async function loadTowersGeoJson(
  towersLayer: L.LayerGroup,
  map: L.Map,
): Promise<void> {
  const file = await fetch("/markers/towers.geojson");
  const geojsonData = await file.json();
  L.geoJSON(geojsonData, {
    style(feature) {
      if (feature?.geometry.type === "MultiPolygon") {
        return {
          color: feature.properties.color ?? "#000000",
          weight: feature.properties.weight ?? 1,
          fillColor: feature.properties.fillColor,
          fillOpacity: feature.properties.fillOpacity ?? 0.2,
        };
      }
      return {};
    },
    pointToLayer(feature, latlng) {
      const selectionData = {
        type: "watchtower" as const,
        name: feature.properties.popupText ?? "Watchtower",
        latlng: { lat: latlng.lat, lng: latlng.lng },
        chunkCount: feature.properties.chunkCount,
        fillColor: feature.properties.fillColor,
      };
      const marker = L.marker(latlng, { icon: towerIcon });
      bindLazyPopup(marker, selectionData);
      return marker;
    },
    onEachFeature(feature, featureLayer) {
      if (
        feature.geometry.type === "MultiPolygon" &&
        feature.properties.popupText
      ) {
        featureLayer.on("click", () => {
          const coords = feature.properties.pointCoords;
          if (coords) {
            L.popup({ className: "bcm-leaflet-popup", pane: "popupOnTop" })
              .setLatLng(coords)
              .setContent(`<div class="bcm-popup"><div class="bcm-popup-text">${feature.properties.popupText}</div></div>`)
              .openOn(map);
          }
        });
      }
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
