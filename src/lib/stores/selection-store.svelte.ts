import type { MapSelection } from '$lib/types/map';

let selection = $state<MapSelection | null>(null);

export function getSelectionState() {
	return {
		get current() {
			return selection;
		},
		get isOpen() {
			return selection !== null;
		}
	};
}

export function setSelection(item: MapSelection): void {
	selection = item;
}

export function clearSelection(): void {
	selection = null;
}
