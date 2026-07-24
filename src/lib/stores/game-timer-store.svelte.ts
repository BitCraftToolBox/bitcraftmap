const DAY_NIGHT_EPOCH = 1733259300;
const DAY_DURATION = 5700; // 95 minutes
const NIGHT_DURATION = 1200; // 20 minutes
const CYCLE_DURATION = DAY_DURATION + NIGHT_DURATION; // 6900s

let isDay = $state(true);
let phaseRemaining = $state(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick(): void {
	const now = Math.floor(Date.now() / 1000);

	const gameSeconds = ((now - DAY_NIGHT_EPOCH) % CYCLE_DURATION + CYCLE_DURATION) % CYCLE_DURATION;
	isDay = gameSeconds < DAY_DURATION;
	phaseRemaining = isDay ? DAY_DURATION - gameSeconds : CYCLE_DURATION - gameSeconds;
}

export function startGameTimer(): void {
	if (intervalId !== null) return;
	tick();
	intervalId = setInterval(tick, 1000);
}

export function stopGameTimer(): void {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

export function getGameTimerState() {
	return {
		get isDay() { return isDay; },
		get phaseRemaining() { return phaseRemaining; },
	};
}

export function formatCountdown(totalSeconds: number): string {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0) {
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
	return `${m}:${String(s).padStart(2, '0')}`;
}
