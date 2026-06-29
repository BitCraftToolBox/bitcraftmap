import L from 'leaflet';
import { buildPopupHtml } from './popup-builder';
import { setSelection } from '$lib/stores/selection-store.svelte';
import { isMobile } from '$lib/utils/device';

export interface ResourceCanvasLayerOptions extends L.LayerOptions {
	color: string;
	radius?: number;
	name?: string;
	tier?: number;
	id?: number;
}

interface RegionPoints {
	lats: number[];
	lngs: number[];
}

export class ResourceCanvasLayer extends L.Layer {
	private _canvas!: HTMLCanvasElement;
	private _ctx!: CanvasRenderingContext2D;
	private _sprite!: HTMLCanvasElement;
	private _pointsByRegion = new Map<number, RegionPoints>();
	private _color: string;
	private _radius: number;
	private _name: string;
	private _tier: number;
	private _id: number;
	private _lodEnabled = false;
	private _dirty = false;
	private _drawnScreenPoints: Float64Array | null = null;
	private _drawnGameCoords: Float64Array | null = null;
	private _screenBuf: number[] = [];
	private _coordBuf: number[] = [];
	private _lastBoundsKey = '';

	constructor(options: ResourceCanvasLayerOptions) {
		super(options);
		this._color = options.color;
		this._radius = options.radius ?? 4;
		this._name = options.name ?? 'Resource';
		this._tier = options.tier ?? 0;
		this._id = options.id ?? 0;
		this._buildSprite();
	}

	private _buildSprite(): void {
		const r = this._radius;
		const size = (r + 1) * 2;
		const sprite = document.createElement('canvas');
		sprite.width = size;
		sprite.height = size;
		const ctx = sprite.getContext('2d')!;
		ctx.beginPath();
		ctx.arc(r + 1, r + 1, r, 0, Math.PI * 2);
		ctx.fillStyle = this._color;
		ctx.fill();
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 1;
		ctx.stroke();
		this._sprite = sprite;
	}

	onAdd(map: L.Map): this {
		this._canvas = L.DomUtil.create('canvas', 'resource-canvas-layer') as HTMLCanvasElement;
		this._canvas.style.pointerEvents = 'none';
		this._ctx = this._canvas.getContext('2d')!;

		const pane = map.getPane('overlayPane')!;
		pane.appendChild(this._canvas);

		map.on('moveend', this._onMoveEnd, this);
		map.on('click', this._onClick, this);

		this._reset(true);
		return this;
	}

	onRemove(map: L.Map): this {
		map.off('moveend', this._onMoveEnd, this);
		map.off('click', this._onClick, this);

		if (this._canvas.parentNode) {
			this._canvas.parentNode.removeChild(this._canvas);
		}

		this._drawnScreenPoints = null;
		this._drawnGameCoords = null;
		return this;
	}

	setRegionPoints(regionId: number, coordinates: [number, number][]): void {
		// GeoJSON coordinates are [lng, lat]
		const lats = new Array<number>(coordinates.length);
		const lngs = new Array<number>(coordinates.length);
		for (let i = 0; i < coordinates.length; i++) {
			lngs[i] = coordinates[i][0];
			lats[i] = coordinates[i][1];
		}
		this._pointsByRegion.set(regionId, { lats, lngs });
		this._scheduleRedraw();
	}

	clearRegion(regionId: number): void {
		this._pointsByRegion.delete(regionId);
		this._scheduleRedraw();
	}

	clearAllRegions(): void {
		this._pointsByRegion.clear();
		this._scheduleRedraw();
	}

	setLodEnabled(enabled: boolean): void {
		this._lodEnabled = enabled;
		this._scheduleRedraw();
	}

	setColor(color: string): void {
		this._color = color;
		this._buildSprite();
		this._scheduleRedraw();
	}

	getPointCount(): number {
		let count = 0;
		for (const data of this._pointsByRegion.values()) {
			count += data.lats.length;
		}
		return count;
	}

	private _scheduleRedraw(): void {
		if (!this._map) return;
		if (this._dirty) return;
		this._dirty = true;
		requestAnimationFrame(() => {
			this._dirty = false;
			if (this._map) this._redraw();
		});
	}

	private _onMoveEnd(): void {
		this._reset();
	}

	private _reset(force: boolean = false): void {
		if (!this._map) return;

		const size = this._map.getSize();
		const topLeft = this._map.containerPointToLayerPoint([0, 0]);

		L.DomUtil.setPosition(this._canvas, topLeft);

		// Check cache BEFORE clearing — canvas.width = x clears even if unchanged
		const p0 = this._map.latLngToContainerPoint([0, 0]);
		const key = `${Math.round(p0.x)},${Math.round(p0.y)},${size.x},${size.y}`;
		if (!force && key === this._lastBoundsKey) return;
		this._lastBoundsKey = key;

		// Only resize when the container size changes; _redraw() handles clearing
		if (this._canvas.width !== size.x || this._canvas.height !== size.y) {
			this._canvas.width = size.x;
			this._canvas.height = size.y;
		}

		this._redraw();
	}

	private _redraw(): void {
		const map = this._map;
		if (!map) return;

		const size = map.getSize();
		const ctx = this._ctx;
		ctx.clearRect(0, 0, size.x, size.y);

		const bounds = map.getBounds();
		const south = bounds.getSouth();
		const north = bounds.getNorth();
		const west = bounds.getWest();
		const east = bounds.getEast();
		const r = this._radius;

		// Build a non-rounded affine transform from (lat, lng) to container pixels.
		// Using map.project avoids latLngToContainerPoint rounding drift on large coordinates.
		const zoom = map.getZoom();
		const pixelOrigin = map.getPixelOrigin();
		const topLeft = map.containerPointToLayerPoint([0, 0]);
		const base = map.project([0, 0], zoom);
		const xAxis = map.project([0, 1000], zoom);
		const yAxis = map.project([1000, 0], zoom);
		const a = (xAxis.x - base.x) / 1000; // lng -> projected x
		const b = (yAxis.x - base.x) / 1000; // lat -> projected x
		const c = (xAxis.y - base.y) / 1000; // lng -> projected y
		const d = (yAxis.y - base.y) / 1000; // lat -> projected y
		const oX = base.x - pixelOrigin.x - topLeft.x;
		const oY = base.y - pixelOrigin.y - topLeft.y;

		const sprite = this._sprite;
		const spriteOffset = r + 1;

		// LOD: show fewer points when zoomed out, all when zoomed in
		const minZoom = map.getMinZoom();
		const LOD_FULL_ZOOM = -3; // Show 100% at zoom -3 and above

		const useLod = this._lodEnabled && zoom < LOD_FULL_ZOOM && this.getPointCount() > 500;
		const showRatio = useLod
			? 0.08 + 0.92 * Math.pow((zoom - minZoom) / (LOD_FULL_ZOOM - minZoom), 2)
			: 1;
		// Threshold for fast integer comparison (Knuth multiplicative hash)
		const lodThreshold = (showRatio * 4294967296) >>> 0;

		// Reuse buffers to reduce GC pressure
		const screenPoints = this._screenBuf;
		const gameCoords = this._coordBuf;
		screenPoints.length = 0;
		gameCoords.length = 0;

		for (const data of this._pointsByRegion.values()) {
			const { lats, lngs } = data;
			for (let i = 0; i < lats.length; i++) {
				const lat = lats[i];
				const lng = lngs[i];

				if (lat < south || lat > north || lng < west || lng > east) continue;

				if (useLod) {
					// Deterministic LOD sampling — coordinate-based so same geographic points
					// stay visible regardless of API response ordering
					const coordHash = ((Math.round(lat) * 2654435761) ^ (Math.round(lng) * 1013904223)) >>> 0;
					if (coordHash > lodThreshold) continue;
				}

				const x = lng * a + lat * b + oX;
				const y = lng * c + lat * d + oY;
				ctx.drawImage(sprite, x - spriteOffset, y - spriteOffset);

				screenPoints.push(x, y);
				gameCoords.push(lat, lng);
			}
		}

		this._drawnScreenPoints = new Float64Array(screenPoints);
		this._drawnGameCoords = new Float64Array(gameCoords);
	}

	private _onClick(e: L.LeafletMouseEvent): void {
		if (!this._drawnScreenPoints || this._drawnScreenPoints.length === 0) return;

		const pt = this._map.latLngToContainerPoint(e.latlng);
		const r = this._radius + 3;
		const rSq = r * r;
		const points = this._drawnScreenPoints;

		let minDist = Infinity;
		let hitIdx = -1;

		for (let i = 0; i < points.length; i += 2) {
			const dx = points[i] - pt.x;
			const dy = points[i + 1] - pt.y;
			const distSq = dx * dx + dy * dy;
			if (distSq < rSq && distSq < minDist) {
				minDist = distSq;
				hitIdx = i;
			}
		}

		if (hitIdx >= 0 && this._drawnGameCoords) {
			const lat = this._drawnGameCoords[hitIdx];
			const lng = this._drawnGameCoords[hitIdx + 1];
			const latlng = L.latLng(lat, lng);

			const selectionData = {
				type: 'resource' as const,
				name: this._name,
				id: this._id,
				tier: this._tier,
				color: this._color,
				latlng: { lat, lng }
			};
			setSelection(selectionData);

			if (!isMobile()) {
				L.popup({ pane: 'popupOnTop', minWidth: 200, className: 'bcm-leaflet-popup' })
					.setLatLng(latlng)
					.setContent(buildPopupHtml(selectionData, this._map.getZoom()))
					.openOn(this._map);
			}
		}
	}
}
