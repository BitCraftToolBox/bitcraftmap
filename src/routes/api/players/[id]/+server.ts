import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const { id } = params;
	if (!id || !/^[0-9]{1,32}$/.test(id)) {
		return json({ error: 'Invalid player ID' }, { status: 400 });
	}

	try {
		const response = await fetch(`https://bitjita.com/api/players/${id}`);
		if (!response.ok) {
			return json({ error: 'Player not found' }, { status: response.status });
		}
		const data = await response.json();
		return json(data);
	} catch {
		return json({ error: 'Failed to fetch player' }, { status: 500 });
	}
};
