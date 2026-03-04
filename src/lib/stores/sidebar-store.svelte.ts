export type SidebarTab = 'layers' | 'features' | 'tracking' | 'regions' | 'settings';

let activeTab = $state<SidebarTab | null>(null);

export function getSidebarState() {
	return {
		get activeTab() {
			return activeTab;
		},
		get isExpanded() {
			return activeTab !== null;
		}
	};
}

export function toggleSidebarTab(tab: SidebarTab): void {
	activeTab = activeTab === tab ? null : tab;
}

export function openSidebarTab(tab: SidebarTab): void {
	activeTab = tab;
}

export function closeSidebar(): void {
	activeTab = null;
}
