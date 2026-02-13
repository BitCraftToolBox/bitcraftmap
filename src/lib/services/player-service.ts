import type { PlayerSearchResult, PlayerSearchResponse } from '$lib/types/geojson';

let abortController: AbortController | null = null;

export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
	if (abortController) {
		abortController.abort();
	}

	if (!query || query.trim().length < 2) {
		return [];
	}

	abortController = new AbortController();

	try {
		const response = await fetch(
			`/api/players?q=${encodeURIComponent(query.trim())}`,
			{ signal: abortController.signal }
		);

		if (!response.ok) return [];

		const data: PlayerSearchResponse = await response.json();
		return data.players;
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
