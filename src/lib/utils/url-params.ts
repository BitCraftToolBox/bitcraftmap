import { goto } from '$app/navigation';
import type { UrlParams } from '$lib/types/geojson';

export function parseUrlParams(): UrlParams {
	const query = new URLSearchParams(window.location.search);
	return {
		heatmap: query.has('heatmap'),
		gistId: query.get('gistId'),
		regionId: query.get('regionId') || '',
		resourceId: query.get('resourceId') || '',
		enemyId: query.get('enemyId') || '',
		noColors: parseInt(query.get('noColors') || '0') === 1,
		playerId: query.get('playerId') || '',
		followPlayer: ['true', '1'].includes(query.get('followPlayer')?.toString().toLowerCase() ?? ''),
		hash: location.hash.slice(1)
	};
}

function setParam(key: string, value: string | null): void {
	const url = new URL(window.location.href);
	if (value) {
		url.searchParams.set(key, value);
	} else {
		url.searchParams.delete(key);
	}
	// Decode percent-encoded commas so URLs stay readable
	const clean = `${url.pathname}${url.search}${url.hash}`.replaceAll('%2C', ',');
	goto(clean, { replaceState: true, noScroll: true, keepFocus: true });
}

export function updateResourceIdParam(resourceIds: Set<number>): void {
	setParam('resourceId', resourceIds.size > 0 ? [...resourceIds].join(',') : null);
}

export function updateRegionIdParam(regionIds: Set<number>): void {
	setParam('regionId', regionIds.size > 0 ? [...regionIds].sort((a, b) => a - b).join(',') : null);
}

export function updatePlayerIdParam(playerIds: Set<string>): void {
	setParam('playerId', playerIds.size > 0 ? [...playerIds].join(',') : null);
}
