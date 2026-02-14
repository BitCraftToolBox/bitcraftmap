<script lang="ts">
	let {
		title,
		layers,
		defaultCollapsed = false,
		isActive,
		onToggle
	}: {
		title: string;
		layers: string[];
		defaultCollapsed?: boolean;
		isActive: (name: string) => boolean;
		onToggle: (name: string) => void;
	} = $props();

	let open = $state(!defaultCollapsed);

	let masterChecked = $derived(layers.every((l) => isActive(l)));
	let masterIndeterminate = $derived(
		!masterChecked && layers.some((l) => isActive(l))
	);

	function handleMasterToggle(): void {
		const anyChecked = layers.some((l) => isActive(l));
		for (const layer of layers) {
			const active = isActive(layer);
			if (anyChecked && active) {
				onToggle(layer);
			} else if (!anyChecked) {
				onToggle(layer);
			}
		}
	}

	let masterEl: HTMLInputElement;
	$effect(() => {
		if (masterEl) {
			masterEl.indeterminate = masterIndeterminate;
			masterEl.checked = masterChecked;
		}
	});
</script>

<details bind:open class="group">
	<summary
		class="flex items-center gap-2 px-2 py-2.5 sm:py-1.5 rounded cursor-pointer select-none hover:bg-white/5 active:bg-white/5 text-sm font-medium text-gray-200 list-none"
	>
		<input
			bind:this={masterEl}
			type="checkbox"
			checked={masterChecked}
			onchange={handleMasterToggle}
			onclick={(e) => e.stopPropagation()}
			class="accent-blue-500"
		/>
		<svg
			class="w-3 h-3 text-gray-400 transition-transform duration-200"
			class:rotate-90={open}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
		{title}
	</summary>

	<div class="ml-4 space-y-1 sm:space-y-0.5 pb-1">
		{#each layers as layer}
			<label class="flex items-center gap-2 px-2 py-2 sm:py-0.5 rounded hover:bg-white/5 active:bg-white/5 cursor-pointer text-sm text-gray-300">
				<input
					type="checkbox"
					checked={isActive(layer)}
					onchange={() => onToggle(layer)}
					class="accent-blue-500"
				/>
				{layer}
			</label>
		{/each}
	</div>
</details>
