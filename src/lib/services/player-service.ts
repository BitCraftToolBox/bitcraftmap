import type { PlayerSearchResult } from '$lib/types/geojson';
import { createAppConfig } from '$lib/config/api';

let abortController: AbortController | null = null;

export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
	if (abortController) {
		abortController.abort();
	}

	if (!query || query.trim().length < 2) {
		return [];
	}

	abortController = new AbortController();

	const config = createAppConfig();
	const url = `${config.relayHost}/v1/database/${config.relayModule}/route/players?q=${encodeURIComponent(query.trim())}`;

	try {
		const response = await fetch(url, { signal: abortController.signal });

		if (!response.ok) return [];

		return await response.json() as PlayerSearchResult[];
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			return [];
		}
		console.error('Player search failed:', err);
		return [];
	} finally {
		abortController = null;
	}
}
