import { goto } from '$app/navigation';
import type { UrlParams } from '$lib/types/geojson';

export function parseUrlParams(): UrlParams {
	const query = new URLSearchParams(window.location.search);
	return {
		heatmap: query.has('heatmap'),
		gistId: query.get('gistId'),
		regionId: query.get('regionId') || '2',
		resourceId: query.get('resourceId') || '',
		enemyId: query.get('enemyId') || '',
		noColors: parseInt(query.get('noColors') || '0') === 1,
		playerId: query.get('playerId') || '',
		followPlayer: ['true', '1'].includes(query.get('followPlayer')?.toString().toLowerCase() ?? ''),
		hash: location.hash.slice(1)
	};
}

export function updatePlayerIdParam(playerIds: Set<string>): void {
	const url = new URL(window.location.href);
	if (playerIds.size > 0) {
		url.searchParams.set('playerId', [...playerIds].join(','));
	} else {
		url.searchParams.delete('playerId');
	}
	goto(`${url.pathname}${url.search}${url.hash}`, {
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}
