import L from "leaflet";
import { GLYPH_ICONS } from "$lib/data/font-icons-data";

/** Normalize a glyph identifier (single char, hex, or "\\uXXXX" escape) to an uppercase hex key. */
export function fontIconKey(id: string | undefined): string | undefined {
  if (!id) return undefined;
  if (id.length === 1) return id.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
  const esc = id.match(/^\\+u([0-9A-Fa-f]{4,5})$/);
  if (esc) return esc[1].toUpperCase();
  if (/^[0-9A-Fa-f]{4,5}$/.test(id)) return id.toUpperCase();
  return undefined;
}

const cache = new Map<string, L.DivIcon>();

/** Create a Leaflet DivIcon rendering an inline SVG from the game's icon font. */
export function createFontIcon(id: string | undefined, size = 24): L.DivIcon | undefined {
  const key = fontIconKey(id);
  const entry = key ? GLYPH_ICONS[key] : undefined;
  if (!key || !entry) return undefined;
  const cacheKey = `${key}:${size}`;
  let icon = cache.get(cacheKey);
  if (!icon) {
    icon = L.divIcon({
      className: "bcm-font-icon",
      html: `<svg viewBox="${entry.viewBox}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">${entry.c}</svg>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
    cache.set(cacheKey, icon);
  }
  return icon;
}
