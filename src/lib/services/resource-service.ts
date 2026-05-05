import type { ResourceSearchResult, ResourceSearchResponse } from '$lib/types/geojson';
import { resourceIndex } from '$lib/data/resource-index';

let abortController: AbortController | null = null;

function localSearch(query: string): ResourceSearchResult[] {
	const q = query.trim().toLowerCase();
	const results: ResourceSearchResult[] = [];

	for (const [id, entry] of Object.entries(resourceIndex)) {
		if (entry.name.toLowerCase().includes(q) || (entry.tag ?? '').toLowerCase().includes(q)) {
			results.push({
				id: Number(id),
				name: entry.name,
				tier: entry.tier,
				tag: entry.tag ?? '',
				rarity: -1
			});
		}
	}

	return results;
}

export async function searchResources(query: string): Promise<ResourceSearchResult[]> {
	if (abortController) {
		abortController.abort();
	}

	if (!query || query.trim().length < 2) {
		return [];
	}

	abortController = new AbortController();

	try {
		const response = await fetch(
			`/api/resources?q=${encodeURIComponent(query.trim())}`,
			{ signal: AbortSignal.any([abortController.signal, AbortSignal.timeout(3000)]) }
		);

		if (!response.ok) return localSearch(query);

		const data: ResourceSearchResponse = await response.json();
		return data.resources;
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			return [];
		}
		console.error('Resource search failed, falling back to local index:', err);
		return localSearch(query);
	} finally {
		abortController = null;
	}
}
