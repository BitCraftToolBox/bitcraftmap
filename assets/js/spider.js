class AutoSpiderfy {
  constructor(map, opts = {}) {
    this.map = map;
    this.opts = Object.assign({
      precision: 6,           // lat/lng rounding to group equality
      footSeparation: 28,     // px between markers on circle
      legLength: 35,          // px line length from center
      minCircle: 2,           // spiderfy when group size >= this
      keepSpiderfied: true,   // stay open until map click/zoom
      legOptions: { color: '#222', weight: 1 }
    }, opts);

    this.groups = new Map();        // key => {centerLL, markers:Set, spider:{lines:[], positions:new Map()}}
    this._onLayerAdd = this._onLayerAdd.bind(this);
    this._onZoomStart = this._onZoomStart.bind(this);
    this._onMapClick = this._onMapClick.bind(this);

    map.on('layeradd', this._onLayerAdd);
    map.on('zoomstart', this._onZoomStart);
    map.on('click', this._onMapClick);
  }

  destroy() {
    this._unspiderfyAll();
    this.map.off('layeradd', this._onLayerAdd);
    this.map.off('zoomstart', this._onZoomStart);
    this.map.off('click', this._onMapClick);
  }

  _key(ll) {
    const p = this.opts.precision;
    return `${+ll.lat.toFixed(p)},${+ll.lng.toFixed(p)}`;
  }

  _getGroup(ll) {
    const k = this._key(ll);
    if (!this.groups.has(k)) {
      this.groups.set(k, { centerLL: ll, markers: new Set(), spider: null });
    }
    return this.groups.get(k);
  }

  _onLayerAdd(e) {
    const m = e.layer;
    if (!(m instanceof L.Marker)) return;

    const ll = m.getLatLng();
    const g = this._getGroup(ll);
    g.markers.add(m);
    m._asp_original = ll;

    // click handler per marker
    m.on('click', () => {
      const group = this._getGroup(m._asp_original);
      if (group.markers.size >= this.opts.minCircle) {
        if (group.spider) {
          if (!this.opts.keepSpiderfied) this._unspiderfy(group);
          else m.openPopup?.();
        } else {
          this._spiderfy(group);
        }
      } else {
        m.openPopup?.();
      }
    });

    // remove from group when marker removed from map
    m.on('remove', () => {
      const g2 = this._getGroup(m._asp_original);
      g2.markers.delete(m);
      if (g2.spider) this._unspiderfy(g2);
      if (g2.markers.size === 0) this.groups.delete(this._key(g2.centerLL));
    });
  }

  _onZoomStart() { this._unspiderfyAll(); }
  _onMapClick()   { if (!this.opts.keepSpiderfied) this._unspiderfyAll(); }

  _unspiderfyAll() { for (const g of this.groups.values()) this._unspiderfy(g); }

  _spiderfy(group) {
    if (group.spider) return;
    const n = group.markers.size;
    if (n < this.opts.minCircle) return;

    const centerPt = this.map.latLngToLayerPoint(group.centerLL);
    const positions = new Map();
    const lines = [];

    const radius = Math.max(
      this.opts.legLength,
      (this.opts.footSeparation * n) / (2 * Math.PI)
    );

    let i = 0;
    for (const m of group.markers) {
      const angle = (2 * Math.PI * i) / n; // uniform circle
      const pt = L.point(
        centerPt.x + radius * Math.cos(angle),
        centerPt.y + radius * Math.sin(angle)
      );
      const newLL = this.map.layerPointToLatLng(pt);
      positions.set(m, newLL);

      // draw leg
      const leg = L.polyline([group.centerLL, newLL], this.opts.legOptions).addTo(this.map);
      lines.push(leg);

      // move marker
      m.setLatLng(newLL);
      i++;
    }

    group.spider = { lines, positions };

    // keep clickable focus on first
    const first = group.markers.values().next().value;
    first && first.openPopup?.();
  }

  _unspiderfy(group) {
    if (!group || !group.spider) return;
    // restore marker positions
    for (const m of group.markers) m.setLatLng(m._asp_original);
    // remove legs
    group.spider.lines.forEach(l => this.map.removeLayer(l));
    group.spider = null;
  }
}

// helper to enable on a map
L.Map.prototype.enableAutoSpiderfy = function (options) {
  if (this._autoSpiderfy) this._autoSpiderfy.destroy();
  this._autoSpiderfy = new AutoSpiderfy(this, options);
  return this._autoSpiderfy;
};