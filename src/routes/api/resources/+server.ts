import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const query = url.searchParams.get('q');
	if (!query || query.trim().length < 2) {
		return json({ resources: [], count: 0 });
	}

	try {
		const response = await fetch(
			`https://bitjita.com/api/resources?q=${encodeURIComponent(query.trim())}`
		);

		if (!response.ok) {
			return json({ resources: [], count: 0 }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch {
		return json({ resources: [], count: 0 }, { status: 500 });
	}
};
