import type { ResourceSearchResult, ResourceSearchResponse } from '$lib/types/geojson';

let abortController: AbortController | null = null;

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
			{ signal: abortController.signal }
		);

		if (!response.ok) return [];

		const data: ResourceSearchResponse = await response.json();
		return data.resources;
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			return [];
		}
		console.error('Resource search failed:', err);
		return [];
	} finally {
		abortController = null;
	}
}
