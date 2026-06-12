const LOD_KEY = 'lodEnabled';
const SIDEBAR_LABELS_KEY = 'showSidebarLabels'

function loadBoolean(key: string, def: boolean): boolean {
	try {
		const val = localStorage.getItem(key);
		return val === null ? def : val === 'true';
	} catch {
		return def;
	}
}

let _lodEnabled = $state(loadBoolean(LOD_KEY, false));
let _sidebarLabels = $state(loadBoolean(SIDEBAR_LABELS_KEY, true));

export function getLodEnabled(): boolean {
	return _lodEnabled;
}

export function setLodEnabled(enabled: boolean): void {
	_lodEnabled = enabled;
	try {
		localStorage.setItem(LOD_KEY, String(enabled));
	} catch { /* ignore */ }
}

export function getSidebarLabelsEnabled(): boolean {
	return _sidebarLabels;
}

export function setSidebarLabelsEnabled(enabled: boolean): void {
	_sidebarLabels = enabled;
	try {
		localStorage.setItem(SIDEBAR_LABELS_KEY, String(enabled));
	} catch { /* ignore */ }
}