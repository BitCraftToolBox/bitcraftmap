<script lang="ts">
	import { Sun, Moon, Timer } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import {
		getGameTimerState,
		startGameTimer,
		stopGameTimer,
		formatCountdown
	} from '$lib/stores/game-timer-store.svelte';

	const timer = getGameTimerState();

	onMount(() => {
		startGameTimer();
		return stopGameTimer;
	});
</script>

<div
	class="flex items-center gap-3 rounded bg-[#1e2433]/90 px-2 py-1 sm:px-3 sm:py-1.5 font-mono text-xs sm:text-sm text-gray-200 shadow-lg backdrop-blur-sm border border-white/10"
>
	<div class="flex items-center gap-1.5" title={timer.isDay ? 'Daytime' : 'Nighttime'}>
		{#if timer.isDay}
			<Sun size={14} class="text-amber-400" />
		{:else}
			<Moon size={14} class="text-blue-300" />
		{/if}
		<span class={timer.isDay ? 'text-amber-300' : 'text-blue-300'}>
			{formatCountdown(timer.phaseRemaining)}
		</span>
	</div>

	<div class="h-3 w-px bg-white/20"></div>

	<div class="flex items-center gap-1.5" title="Next task reset">
		<Timer size={14} class="text-emerald-400" />
		<span class="text-emerald-300">
			{formatCountdown(timer.taskResetRemaining)}
		</span>
	</div>
</div>
