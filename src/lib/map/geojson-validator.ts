import { iconsManifest } from '$lib/data/icons-manifest';
import { escapeHTML } from '$lib/utils/escape-html';
import type { GeoJSON } from 'geojson';

export function validateGeoJson(untrustedString: string): GeoJSON.FeatureCollection {
	if (typeof untrustedString !== 'string') {
		throw new Error('untrustedString must be a string');
	}

	let decodedString: string;
	try {
		decodedString = decodeURIComponent(untrustedString);
	} catch {
		throw new Error('Bad URI encoding');
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(decodedString);
	} catch {
		throw new Error('Invalid JSON');
	}

	if (Array.isArray(parsed)) {
		throw new Error('geoJson must not be an array');
	}

	const geoJson = parsed as Record<string, unknown>;

	if (geoJson.type !== 'FeatureCollection') {
		throw new Error("geoJson doesn't have FeatureCollection");
	}

	if (!geoJson.features || !Array.isArray(geoJson.features)) {
		throw new Error("geoJson doesn't have features or features isn't array");
	}

	for (const feature of geoJson.features) {
		const props = feature.properties;
		if (!props) continue;

		if (props.iconName) {
			if (typeof props.iconName !== 'string') {
				props.iconName = 'waypoint';
			}
			if (!(props.iconName in iconsManifest)) {
				props.iconName = 'waypoint';
			}
		}

		if (props.iconSize) {
			if (
				!Array.isArray(props.iconSize) ||
				props.iconSize.length !== 2 ||
				!props.iconSize.every((v: unknown) => typeof v === 'number')
			) {
				props.iconSize = [32, 32];
			}
		}

		if (props.popupText) {
			if (
				Array.isArray(props.popupText) &&
				props.popupText.every((v: unknown) => typeof v === 'string')
			) {
				props.popupText = props.popupText.map(escapeHTML);
			} else if (typeof props.popupText === 'string') {
				props.popupText = escapeHTML(props.popupText);
			} else {
				throw new Error('popupText must be string or array of strings');
			}
		}
	}

	return geoJson as unknown as GeoJSON.FeatureCollection;
}
