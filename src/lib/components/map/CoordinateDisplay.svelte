<script lang="ts">
	let { coords }: { coords: string } = $props();
</script>

<div
	class="absolute bottom-3 left-3 z-[1000] rounded bg-[#1e2433]/90 px-3 py-1.5 font-mono text-sm text-gray-200 shadow-lg backdrop-blur-sm border border-white/10"
>
	{coords}
</div>
