import { SvelteSet } from 'svelte/reactivity';

/** All 25 regions in the 5×5 grid (1 = bottom-left, 25 = top-right). */
export const ALL_REGIONS: number[] = Array.from({ length: 25 }, (_, i) => i + 1);

/** Only the center 3×3 regions are currently playable. *//*  seasonal rgs  v------------v*/
export const AVAILABLE_REGIONS: number[] = [7, 8, 9, 12, 13, 14, 17, 18, 19, 3, 11, 15, 23];

const STORAGE_KEY = 'selectedRegions';

function loadFromStorage(): number[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed: number[] = JSON.parse(stored);
			return parsed.filter((n) => AVAILABLE_REGIONS.includes(n));
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
				? AVAILABLE_REGIONS
				: [...selectedRegions].sort((a, b) => a - b);
		},
		get isAllSelected(): boolean {
			return selectedRegions.size === 0;
		}
	};
}

export function toggleRegion(regionId: number): void {
	if (!AVAILABLE_REGIONS.includes(regionId)) return;
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
	const incoming = new Set([...regions].filter((r) => AVAILABLE_REGIONS.includes(r)));
	selectedRegions.clear();
	// If every available region is selected, keep the set empty (empty = all)
	if (incoming.size < AVAILABLE_REGIONS.length || !AVAILABLE_REGIONS.every((r) => incoming.has(r))) {
		for (const r of incoming) {
			selectedRegions.add(r);
		}
	}
	persist();
}
