<script lang="ts">
	let { coords }: { coords: string } = $props();
</script>

<div
	class="absolute bottom-3 left-3 z-[1000] rounded bg-[#1e2433]/90 px-2 py-1 sm:px-3 sm:py-1.5 font-mono text-xs sm:text-sm text-gray-200 shadow-lg backdrop-blur-sm border border-white/10"
>
	{coords}
</div>
