import { createAppConfig } from '$lib/config/api';

const config = createAppConfig();

export async function fetchResource(regionId: number, resourceId: number): Promise<GeoJSON.FeatureCollection> {
	const response = await fetch(
		`${config.backendUrl}/region${regionId}/resource/${resourceId}`
	);
	return response.json();
}

export async function fetchEnemy(regionId: number, enemyId: number): Promise<GeoJSON.FeatureCollection> {
	const response = await fetch(
		`${config.backendUrl}/region${regionId}/enemy/${enemyId}`
	);
	return response.json();
}
