import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { PlayerSearchResponse } from '$lib/types/geojson';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const query = url.searchParams.get('q');
	if (!query || query.trim().length < 2) {
		return json({ players: [], total: 0 });
	}

	try {
		const response = await fetch(
			`https://bitjita.com/api/players?q=${encodeURIComponent(query.trim())}`
		);

		if (!response.ok) {
			return json({ players: [], total: 0 }, { status: response.status });
		}

		const data: PlayerSearchResponse = await response.json();
		return json(data);
	} catch {
		return json({ players: [], total: 0 }, { status: 500 });
	}
};
