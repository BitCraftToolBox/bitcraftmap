import type { MapConfig } from "$lib/types/map";
import L from "leaflet";

export function createMapConfig(): MapConfig {
  const apothem = 2 / Math.sqrt(3);
  const mapWidth = 23040;
  const mapHeight = 23040;
  const mapImageURL = "/maps/map_2560.webp";

  return {
    apothem,
    mapWidth,
    mapHeight,
    mapImageURL,
    preferCanvas: true,
    zoomAnimation: false,
    attributionControl: false,
    zoomControl: false,
    boxZoom: false,
    minZoom: -5,
    maxZoom: 5,
    zoomSnap: 0.1,
    crs: L.extend({}, L.CRS.Simple, {
      projection: {
        project(latlng: L.LatLng) {
          return new L.Point(latlng.lng, -latlng.lat / apothem);
        },
        unproject(point: L.Point) {
          return new L.LatLng(-point.y * apothem, point.x);
        },
        bounds: L.bounds([0, 0], [mapWidth, mapHeight]),
      },
      transformation: new L.Transformation(1, 0, 1, 0),
      scale(z: number) {
        return Math.pow(2, z);
      },
      infinite: false,
    }),
  };
}
