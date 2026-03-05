const LOD_KEY = 'settings:lodEnabled';

function loadLodEnabled(): boolean {
	try {
		const val = localStorage.getItem(LOD_KEY);
		return val === null ? false : val === 'true';
	} catch {
		return false;
	}
}

let _lodEnabled = $state(loadLodEnabled());

export function getLodEnabled(): boolean {
	return _lodEnabled;
}

export function setLodEnabled(enabled: boolean): void {
	_lodEnabled = enabled;
	try {
		localStorage.setItem(LOD_KEY, String(enabled));
	} catch { /* ignore */ }
}
