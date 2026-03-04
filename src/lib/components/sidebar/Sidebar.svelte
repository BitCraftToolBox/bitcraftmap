<script lang="ts">
	import type L from 'leaflet';
	import { fly, fade } from 'svelte/transition';
	import { Layers, MapPinned, Crosshair, Globe, XIcon, Settings } from '@lucide/svelte';
	import { getSidebarState, toggleSidebarTab, closeSidebar, type SidebarTab } from '$lib/stores/sidebar-store.svelte';
	import { getTrackingState } from '$lib/stores/tracking-store.svelte';
	import LayersPanel from '$lib/components/layers/LayersPanel.svelte';
	import LayerPanel from '$lib/components/layers/LayerPanel.svelte';
	import TrackingPanel from '$lib/components/tracking/TrackingPanel.svelte';
	import RegionSelector from '$lib/components/regions/RegionSelector.svelte';
	import SettingsPanel from '$lib/components/settings/SettingsPanel.svelte';

	let {
		genericToggle,
		isActive,
		onToggleLayer,
		onToggleResource,
		onTogglePlayer,
		onRemoveResource,
		onRemovePlayer,
		onColorChangeResource,
		onColorChangePlayer,
		onRegionsChange
	}: {
		genericToggle: Record<string, L.LayerGroup>;
		isActive: (name: string) => boolean;
		onToggleLayer: (name: string) => void;
		onToggleResource: (id: number) => void;
		onTogglePlayer: (entityId: string) => void;
		onRemoveResource: (id: number) => void;
		onRemovePlayer: (entityId: string) => void;
		onColorChangeResource: (id: number, color: string) => void;
		onColorChangePlayer: (entityId: string, color: string) => void;
		onRegionsChange: () => void;
	} = $props();

	const sidebar = getSidebarState();
	const tracking = getTrackingState();

	const tabs: { id: SidebarTab; label: string; icon: typeof Layers }[] = [
		{ id: 'layers', label: 'Layers', icon: Layers },
		{ id: 'features', label: 'Features', icon: MapPinned },
		{ id: 'tracking', label: 'Tracking', icon: Crosshair },
		{ id: 'regions', label: 'Regions', icon: Globe },
		{ id: 'settings', label: 'Settings', icon: Settings }
	];

	function tabLabel(id: SidebarTab): string {
		return tabs.find((t) => t.id === id)?.label ?? '';
	}
</script>

<!-- Desktop: icon rail + expandable panel -->
<div class="hidden sm:flex absolute top-16 left-3 z-ui flex-row items-start">
	<!-- Icon rail -->
	<div class="flex flex-col gap-1 rounded-lg bg-[#1e2433]/95 border border-white/10 backdrop-blur-sm shadow-lg p-1">
		{#each tabs as tab}
			<button
				onclick={() => toggleSidebarTab(tab.id)}
				class="relative w-10 h-10 flex items-center justify-center rounded-md transition-colors
					{sidebar.activeTab === tab.id
					? 'bg-blue-500/20 text-blue-400'
					: 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}"
				aria-label={tab.label}
				title={tab.label}
			>
				<tab.icon size={18} />
				{#if tab.id === 'tracking' && tracking.items.length > 0}
					<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400"></span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Expanded panel -->
	{#if sidebar.isExpanded}
		<div
			transition:fly={{ x: -20, duration: 200 }}
			class="ml-1 shrink-0 max-h-[calc(100dvh-8rem)] overflow-y-auto overflow-x-hidden rounded-lg bg-[#1e2433]/95 border border-white/10 backdrop-blur-sm shadow-lg transition-[width] duration-200
				{sidebar.activeTab === 'settings' ? 'w-80 min-w-80 max-w-80' : 'w-64 min-w-64 max-w-64'}"
		>
			<div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
				<h2 class="text-xs font-semibold text-gray-200 uppercase tracking-wider">
					{tabLabel(sidebar.activeTab!)}
				</h2>
				<button
					onclick={closeSidebar}
					class="p-1 text-gray-400 hover:text-gray-200 transition-colors"
					aria-label="Close panel"
				>
					<XIcon size={16} />
				</button>
			</div>
			<div class="p-2">
				{#if sidebar.activeTab === 'layers'}
					<LayersPanel />
				{:else if sidebar.activeTab === 'features'}
					<LayerPanel {genericToggle} {isActive} onToggle={onToggleLayer} />
				{:else if sidebar.activeTab === 'tracking'}
					<TrackingPanel
						{onToggleResource}
						{onTogglePlayer}
						{onRemoveResource}
						{onRemovePlayer}
						{onColorChangeResource}
						{onColorChangePlayer}
					/>
				{:else if sidebar.activeTab === 'regions'}
					<RegionSelector {onRegionsChange} />
				{:else if sidebar.activeTab === 'settings'}
					<SettingsPanel />
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Mobile: bottom tab bar + bottom sheet -->
<div class="sm:hidden">
	<!-- Bottom sheet content -->
	{#if sidebar.isExpanded}
		<button
			transition:fade={{ duration: 200 }}
			class="fixed inset-0 z-ui bg-black/40"
			onclick={closeSidebar}
			aria-label="Close panel"
		></button>

		<div
			transition:fly={{ y: 300, duration: 250 }}
			class="fixed bottom-12 left-0 right-0 z-overlay max-h-[70dvh] overflow-y-auto rounded-t-xl bg-[#1e2433]/95 border-t border-white/10 shadow-xl backdrop-blur-sm"
		>
			<!-- Drag handle -->
			<div class="flex justify-center py-2">
				<div class="w-10 h-1 rounded-full bg-white/20"></div>
			</div>

			<div class="flex items-center justify-between px-4 pb-2">
				<h2 class="text-sm font-semibold text-gray-200 uppercase tracking-wider">
					{tabLabel(sidebar.activeTab!)}
				</h2>
				<button
					onclick={closeSidebar}
					class="p-2 text-gray-400 active:text-gray-200 transition-colors"
					aria-label="Close panel"
				>
					<XIcon size={18} />
				</button>
			</div>

			<div class="px-3 pb-4">
				{#if sidebar.activeTab === 'layers'}
					<LayersPanel />
				{:else if sidebar.activeTab === 'features'}
					<LayerPanel {genericToggle} {isActive} onToggle={onToggleLayer} />
				{:else if sidebar.activeTab === 'tracking'}
					<TrackingPanel
						{onToggleResource}
						{onTogglePlayer}
						{onRemoveResource}
						{onRemovePlayer}
						{onColorChangeResource}
						{onColorChangePlayer}
					/>
				{:else if sidebar.activeTab === 'regions'}
					<RegionSelector {onRegionsChange} />
				{:else if sidebar.activeTab === 'settings'}
					<SettingsPanel />
				{/if}
			</div>
		</div>
	{/if}

	<!-- Tab bar (always visible) -->
	<div class="fixed bottom-0 left-0 right-0 z-overlay flex items-center justify-around bg-[#1e2433] border-t border-white/10 h-12">
		{#each tabs as tab}
			<button
				onclick={() => toggleSidebarTab(tab.id)}
				class="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
					{sidebar.activeTab === tab.id
					? 'text-blue-400'
					: 'text-gray-500 active:text-gray-300'}"
				aria-label={tab.label}
			>
				<tab.icon size={18} />
				<span class="text-[10px]">{tab.label}</span>
				{#if tab.id === 'tracking' && tracking.items.length > 0}
					<span class="absolute top-1.5 left-1/2 ml-2 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>
