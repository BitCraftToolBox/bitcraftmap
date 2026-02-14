import { SvelteSet } from 'svelte/reactivity';

/** Current maximum region count. Change to 25 when game expands. */
export const ALL_REGIONS: number[] = Array.from({ length: 9 }, (_, i) => i + 1);

const STORAGE_KEY = 'selectedRegions';

function loadFromStorage(): number[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed: number[] = JSON.parse(stored);
			return parsed.filter((n) => ALL_REGIONS.includes(n));
		}
	} catch {
		/* ignore */
	}
	return [];
}

const selectedRegions = new SvelteSet<number>(loadFromStorage());

function persist(): void {
	if (selectedRegions.size === 0) {
		localStorage.removeItem(STORAGE_KEY);
	} else {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedRegions]));
	}
}

export function getRegionState() {
	return {
		get selected() {
			return selectedRegions;
		},
		get effectiveRegions(): number[] {
			return selectedRegions.size === 0
				? ALL_REGIONS
				: [...selectedRegions].sort((a, b) => a - b);
		},
		get isAllSelected(): boolean {
			return selectedRegions.size === 0;
		}
	};
}

export function toggleRegion(regionId: number): void {
	if (selectedRegions.has(regionId)) {
		selectedRegions.delete(regionId);
	} else {
		selectedRegions.add(regionId);
	}
	persist();
}

export function selectAllRegions(): void {
	selectedRegions.clear();
	persist();
}

export function setRegions(regions: Iterable<number>): void {
	selectedRegions.clear();
	for (const r of regions) {
		selectedRegions.add(r);
	}
	persist();
}
