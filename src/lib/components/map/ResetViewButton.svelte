<script lang="ts">
	let { onReset }: { onReset: () => void } = $props();
</script>

<button
	onclick={onReset}
	class="absolute bottom-3 left-44 z-[1000] rounded bg-[#1e2433]/90 px-3 py-1.5 text-sm text-gray-200 shadow-lg backdrop-blur-sm border border-white/10 hover:bg-[#2a3245] transition-colors cursor-pointer"
	aria-label="Reset map view"
>
	Reset View
</button>
