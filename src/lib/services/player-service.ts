import type { PlayerSearchResult, PlayerSearchResponse } from '$lib/types/geojson';

export interface PlayerLookupResult {
	username: string;
	locationX: number | null;
	locationZ: number | null;
}

export async function lookupPlayer(entityId: string): Promise<PlayerLookupResult> {
	try {
		const response = await fetch(`/api/players/${entityId}`);
		if (!response.ok) return { username: entityId, locationX: null, locationZ: null };
		const data = await response.json();
		const player = data.player;
		return {
			username: player?.username || entityId,
			locationX: player?.locationX ?? null,
			locationZ: player?.locationZ ?? null
		};
	} catch {
		return { username: entityId, locationX: null, locationZ: null };
	}
}

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
