import { fetchResource } from '$lib/services/api-service';
import type { ResourceEvent } from '$lib/services/websocket-service';
import type { ResourceCanvasLayer } from '$lib/map/resource-canvas-layer';

const THROTTLE_MS = 7000;

interface ThrottleEntry {
	timerId: ReturnType<typeof setTimeout>;
}

const throttleMap = new Map<string, ThrottleEntry>();

export interface ResourceUpdateContext {
	resourceLayers: Record<number, ResourceCanvasLayer>;
	getActiveRegions: () => number[];
}

export function handleResourceEvent(event: ResourceEvent, ctx: ResourceUpdateContext): void {
	const { resource_id, region_id } = event;
	const regionNum = parseInt(region_id, 10);

	// Ignore if resource not tracked
	if (!ctx.resourceLayers[resource_id]) return;

	// Ignore if region not active
	const activeRegions = ctx.getActiveRegions();
	if (!activeRegions.includes(regionNum)) return;

	// Both insert and delete trigger a throttled re-fetch
	scheduleRefetch(resource_id, regionNum, ctx);
}

function scheduleRefetch(resourceId: number, regionId: number, ctx: ResourceUpdateContext): void {
	const key = `${resourceId}-${regionId}`;

	// Already scheduled
	if (throttleMap.has(key)) return;

	const entry: ThrottleEntry = {
		timerId: setTimeout(() => {
			throttleMap.delete(key);
			executeRefetch(resourceId, regionId, ctx);
		}, THROTTLE_MS)
	};
	throttleMap.set(key, entry);
}

async function executeRefetch(
	resourceId: number,
	regionId: number,
	ctx: ResourceUpdateContext
): Promise<void> {
	const canvasLayer = ctx.resourceLayers[resourceId];
	if (!canvasLayer) return;

	try {
		const geoJson = await fetchResource(regionId, resourceId);

		if (
			geoJson.features[0]?.geometry &&
			(geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates?.length > 0
		) {
			const coords = (geoJson.features[0].geometry as GeoJSON.MultiPoint).coordinates;
			canvasLayer.setRegionPoints(regionId, coords as [number, number][]);
		} else {
			canvasLayer.clearRegion(regionId);
		}
	} catch (err) {
		console.error(`Failed to re-fetch resource ${resourceId} for region ${regionId}:`, err);
	}
}

export function cancelPendingRefetches(resourceId: number): void {
	for (const [key, entry] of throttleMap.entries()) {
		if (key.startsWith(`${resourceId}-`)) {
			clearTimeout(entry.timerId);
			throttleMap.delete(key);
		}
	}
}

export function cancelAllPendingRefetches(): void {
	for (const entry of throttleMap.values()) {
		clearTimeout(entry.timerId);
	}
	throttleMap.clear();
}
