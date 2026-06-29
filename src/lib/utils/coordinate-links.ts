export interface CoordinateView {
	n: number;
	e: number;
	z: number;
}

export function buildCoordinateViewUrl(view: CoordinateView): string {
	const url = new URL(window.location.href);
	url.searchParams.set('center', `${view.n},${view.e}`);
	url.searchParams.set('zoom', view.z.toFixed(1));
	return url.toString();
}

export function buildChatCoordinateLink(view: Pick<CoordinateView, 'n' | 'e'>): string {
	return `(coord=${view.n},${view.e})`;
}
