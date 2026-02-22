# What is this?

This is the source repository for [BitCraft Map 🗺️](https://bitcraftmap.com)

## Overview — Documentation

This file explains how the map is built, how data is loaded, and how you can, as a user, share waypoints with people.

- **Tech**: [Leaflet](https://leafletjs.com/) and the [leaflet-control-search](https://github.com/stefanocudini/leaflet-search) plugin.
- **Map Image**: `assets/maps/map.png` rendered over a [simple CRS map](https://leafletjs.com/examples/crs-simple/crs-simple.html) with custom bounds. This image is generated from BitCraft files.
- **Coordinate System**: The map will accept "Small Hex" coordinates (see F4 debug menu ingame) Small hex coordinates range from 0 to 23040 and are the location X and location Z you get from the database. The map will also accept Small Floating Hex coordinates (case for players and animals).
- **Search Plugin**: the search control plugin will look into **ruined cities** and **claims** layers, using the claim name as the searchable text.
- **Feature to share waypoints**: Share waypoints and shapes by writing GeoJSON.

## Feature — Custom Markers

You can add your **own markers and shapes** to the map by supplying a GeoJSON object. There are two ways of supplying the GeoJSON object.

### What is GeoJSON ?

[GeoJSON](https://datatracker.ietf.org/doc/html/rfc7946) is an open standard format for representing geographical features as JSON.  
It defines simple geometries like **points**, **lines**, and **polygons**, grouped inside a `FeatureCollection`. Each feature can carry custom properties (metadata) alongside its geometry, making it ideal for describing map markers, shapes, and related data in a portable way.

Useful links to validate your GeoJSON :

- [GeoJSON need to be valid Json](https://jsonlint.com/)
- [You can validate GeoJSON specifically here](https://geojsonlint.com/)

### Methods for sharing waypoints

1. **URL Hash** – Append the GeoJSON after `#` in the URL. Spaces and Line Carries should not break this functionality, please open an issue if you find a case where it does.
2. **GitHub Gist** – Upload the GeoJSON into a [GitHub Gist](https://gist.github.com/) as public, then use the ID as `?gistId=...` parameter

### Working GeoJSON Example

[You can try this GeoJSON here: https://bitcraftmap.com/?gistId=8ecf9520d96e13908c060c871430ed37](https://bitcraftmap.com/?gistId=8ecf9520d96e13908c060c871430ed37)

```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "popupText": "My custom waypoint",
                "iconName": "HexCoin3",
                "iconSize": [128,128],
                "turnLayerOff": ["ruinedLayer","treesLayer","templesLayer"]
            },
            "geometry": {
                "type": "Point",
                "coordinates": [15000, 15000]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "popupText": "My custom polygon",
                "color": "#c24747ff"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [23040, 11520],
                    [19666, 19666],
                    [11520, 23040],
                    [3374, 19666],
                    [0, 11520],
                    [3374, 3374],
                    [11520, 0],
                    [19666, 3374],
                    [23040, 11520]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "makeCanvas": 1,
                "radius": 50,
                "fillColor": "#3dd53fff",
                "weight": 5
            },
            "geometry": {
                "type": "Point",
                "coordinates": [15000, 15000]
            }
        }
    ]
}
```

### What GeoJSON is accepted ?

Any GeoJSON following the RFC linked above and being validated by [geojsonlint](https://geojsonlint.com/) is accepted. If you find any incompatibility, please open an issue. Additionally, some custom properties are accepted to enhance user experience.

### Available properties

| Property | Type | Values | Default | Effect |
|---|---|---|---|---|
| `popupText` | string or string[] | Plain text, array of texts | — | Binds a popup to the feature with the given content. Arrays become multi-line (`<br>`). HTML is **escaped**. |
| `makeCanvas` | boolean | `true` / `false` | `false` | If `true`, draws a `CircleMarker` on canvas instead of a waypoint. This makes it possible to display much more information. |
| `turnLayerOn` | string or string[] | See **Layer Name Reference** | — | After rendering, **adds** those layers to the map. |
| `turnLayerOff` | string or string[] | See **Layer Name Reference** | — | After rendering, **removes** those layers from the map. |
| `iconName` | string | See **Icon Name Reference** | validated to `waypoint` | Icon you can display as your waypoint. See **Icon Name Reference** for list of possible icons |
| `iconSize` | `[w, h]` | Array of 2 numbers | validated to `[32,32]` | Size of the icon you want to display in pixel weight and width |
| `flyTo` | `[lat, lng]` | Small Hex Coordinates (`0` to `23040`) | — | If present **with** `zoomTo`, calls `map.flyTo(flyTo, zoomTo)`. |
| `zoomTo` | number | Leaflet zoom level (`-6` to `6`) | — | Used with `flyTo`. |
| `noPan` | boolean | `true` / `false` | `false` | If feature has bounds and you didn’t use `flyTo`, the map **fits** bounds unless `noPan` is true. |
| `radius` | number | Radius in pixels | `1` when `makeCanvas: true` | Circle radius. Only used with `makeCanvas` |
| `color` | string | Hex Color | `#3388ff` | Stroke color. Used with polygons, lines and `makeCanvas` |
| `weight` | number | Stroke width in pixels | `3` | Stroke width. Used with polygons, lines and `makeCanvas` |
| `opacity` | number | `0` to `1` | `1` | Stroke opacity. Used with polygons, lines and `makeCanvas` |
| `fillColor` | string | Hex Color | `#3388ff` | Fill color. Used with polygons, lines and `makeCanvas` |
| `fillOpacity` | number | `0` to `1` | `0.2` | Fill opacity. Used with polygons, lines and `makeCanvas` |

### Icon Name Reference (for `iconName`)

The full list of icons available for this properties is available [in this file](./assets/images/manifest.js)

### Layer Name Reference (for `turnLayerOn` / `turnLayerOff`)

You can turn on an off these layers :

``` JS
treesLayer
templesLayer
ruinedLayer
banksLayer
marketsLayer
waystonesLayer
waypointsLayer
claimT0Layer
claimT1Layer
claimT2Layer
claimT3Layer
claimT4Layer
claimT5Layer
claimT6Layer
claimT7Layer
claimT8Layer
claimT9Layer
claimT10Layer
caveT1Layer
caveT2Layer
caveT3Layer
caveT4Layer
caveT5Layer
caveT6Layer
caveT7Layer
caveT8Layer
caveT9Layer
caveT10Layer
```
