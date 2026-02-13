import L from 'leaflet';
import { createIcon } from './create-icon';
import type { BitcraftFeatureProperties } from '$lib/types/geojson';

export interface PaintContext {
	map: L.Map;
	allLayers: Record<string, L.LayerGroup>;
}

export function paintGeoJson(
	geoJson: GeoJSON.FeatureCollection,
	layer: L.LayerGroup,
	ctx: PaintContext,
	pan: boolean = true
): void {
	const { map, allLayers } = ctx;

	// Handle flyTo/zoomTo/turnLayerOn/turnLayerOff for features with null geometry
	if (geoJson?.features) {
		for (const feature of geoJson.features) {
			if (!feature.geometry) {
				const props = feature.properties as BitcraftFeatureProperties;
				handleLayerToggle(props, map, allLayers);

				if (pan && !props?.noPan) {
					handleNavigation(props, map);
				}
			}
		}
	}

	L.geoJSON(geoJson, {
		pointToLayer(feature, latlng) {
			const props = feature.properties as BitcraftFeatureProperties;

			if (props?.type === 'tooltip') {
				return new L.Popup({ autoPan: false, autoClose: false })
					.setLatLng(latlng)
					.setContent(props.popupText as string);
			}

			if (props?.makeCanvas) {
				return new L.CircleMarker(latlng, { radius: props.radius ?? 1 });
			}

			map.createPane('markerOnTop');
			map.getPane('markerOnTop')!.style.zIndex = '980';
			map.createPane('popupOnTop');
			map.getPane('popupOnTop')!.style.zIndex = '990';

			const waypointIcon =
				props?.iconName || props?.iconSize
					? createIcon(props.iconName, props.iconSize)
					: createIcon('waypoint');

			return L.marker(latlng, { icon: waypointIcon, pane: 'markerOnTop' });
		},

		style(feature) {
			const props = feature?.properties as BitcraftFeatureProperties;
			return {
				color: props?.color ?? '#000000',
				fillColor: props?.fillColor ?? '#3388ff',
				radius: 4,
				weight: props?.weight ?? 1,
				opacity: props?.opacity ?? 1,
				fillOpacity: props?.fillOpacity ?? 1
			};
		},

		onEachFeature(feature, featureLayer) {
			const props = feature.properties as BitcraftFeatureProperties;

			if (props?.popupText) {
				let finalPopupText = '';
				if (Array.isArray(props.popupText)) {
					finalPopupText = props.popupText.join('<br>');
				} else {
					finalPopupText = props.popupText;
				}
				featureLayer.bindPopup(finalPopupText, { pane: 'popupOnTop' });
			}

			handleLayerToggle(props, map, allLayers);

			if (props?.flyTo && props?.zoomTo != null && !props.noPan && pan) {
				map.flyTo(props.flyTo, props.zoomTo);
			} else if (props?.zoomTo != null && !props.noPan && pan) {
				map.flyTo(map.getCenter(), props.zoomTo);
			} else if (
				'getBounds' in featureLayer &&
				typeof (featureLayer as L.Polyline).getBounds === 'function' &&
				(featureLayer as L.Polyline).getBounds().isValid() &&
				!props?.noPan &&
				pan
			) {
				map.fitBounds((featureLayer as L.Polyline).getBounds());
			}
		}
	}).addTo(layer);
}

function handleLayerToggle(
	props: BitcraftFeatureProperties | null,
	map: L.Map,
	allLayers: Record<string, L.LayerGroup>
): void {
	if (!props) return;

	if (props.turnLayerOn) {
		const names = Array.isArray(props.turnLayerOn) ? props.turnLayerOn : [props.turnLayerOn];
		for (const layerName of names) {
			const target = allLayers[layerName];
			if (target) map.addLayer(target);
		}
	}

	if (props.turnLayerOff) {
		const names = Array.isArray(props.turnLayerOff) ? props.turnLayerOff : [props.turnLayerOff];
		for (const layerName of names) {
			const target = allLayers[layerName];
			if (target) map.removeLayer(target);
		}
	}
}

function handleNavigation(props: BitcraftFeatureProperties | null, map: L.Map): void {
	if (!props) return;

	if (props.flyTo && props.zoomTo != null) {
		map.flyTo(props.flyTo, props.zoomTo);
	} else if (props.zoomTo != null) {
		const center = map.getCenter();
		if (center) {
			map.flyTo(center, props.zoomTo);
		} else {
			map.setZoom(props.zoomTo);
		}
	}
}
