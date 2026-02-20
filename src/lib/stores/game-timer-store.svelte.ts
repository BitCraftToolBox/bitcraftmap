const DAY_NIGHT_EPOCH = 1733259300;
const DAY_DURATION = 5700; // 95 minutes
const NIGHT_DURATION = 1200; // 20 minutes
const CYCLE_DURATION = DAY_DURATION + NIGHT_DURATION; // 6900s

const TASK_EPOCH_OFFSET = 3000; // original: -10*60 + 1*60*60
const TASK_CYCLE_DURATION = 14400; // 4 hours
const TASK_RESET_INTERVAL = 10800; // 3 hours
const TASK_GRACE_OFFSET = 600; // 10 minutes

let isDay = $state(true);
let phaseRemaining = $state(0);
let taskResetRemaining = $state(0);

let intervalId: ReturnType<typeof setInterval> | null = null;

function tick(): void {
	const now = Math.floor(Date.now() / 1000);

	const gameSeconds = ((now - DAY_NIGHT_EPOCH) % CYCLE_DURATION + CYCLE_DURATION) % CYCLE_DURATION;
	isDay = gameSeconds < DAY_DURATION;
	phaseRemaining = isDay ? DAY_DURATION - gameSeconds : CYCLE_DURATION - gameSeconds;

	const taskSeconds = ((now - TASK_EPOCH_OFFSET) % TASK_CYCLE_DURATION + TASK_CYCLE_DURATION) % TASK_CYCLE_DURATION;
	const adjustedTaskTime = ((taskSeconds - TASK_GRACE_OFFSET) % TASK_RESET_INTERVAL + TASK_RESET_INTERVAL) % TASK_RESET_INTERVAL;
	taskResetRemaining = TASK_RESET_INTERVAL - adjustedTaskTime;
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
		get taskResetRemaining() { return taskResetRemaining; }
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
