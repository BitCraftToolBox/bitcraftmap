import type { TimerEntry } from '$lib/types/geojson';
import { createAppConfig } from '$lib/config/api';
import { applyTimerUpdates } from '$lib/map/geojson-loader';

const POLL_INTERVAL_MS = 10 * 60 * 1000;

let intervalId: ReturnType<typeof setInterval> | null = null;

async function fetchTimers(): Promise<TimerEntry[]> {
	const config = createAppConfig();
	const url = `${config.relayHost}/v1/database/${config.relayModule}/route/timers`;

	try {
		const response = await fetch(url);
		if (!response.ok) return [];
		return await response.json() as TimerEntry[];
	} catch (err) {
		console.error('Timer fetch failed:', err);
		return [];
	}
}

async function refreshTimers(): Promise<void> {
	const timers = await fetchTimers();
	applyTimerUpdates(timers);
}

/** Fetch timers immediately, then again every 10 minutes. Call once the timer-bearing layers have loaded. */
export function startTimersService(): void {
	if (intervalId !== null) return;
	refreshTimers();
	intervalId = setInterval(refreshTimers, POLL_INTERVAL_MS);
}

export function stopTimersService(): void {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
}
