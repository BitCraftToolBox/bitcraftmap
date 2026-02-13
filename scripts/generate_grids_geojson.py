import json

width = 23040     # total width of map
height = 23040    # total height of map
chunk_rows = 240  # number of chunk rows
chunk_cols = 240  # number of chunk columns
region_rows = 3   # number of region rows
region_cols = 3   # number of region columns
origin_x = 0      # lower-left X coordinate
origin_y = 0      # lower-left Y coordinate

# Calculate spacing
chunk_dx = width / chunk_rows
chunk_dy = height / chunk_cols
region_dx = width / region_rows
region_dy = height / region_cols

chunks_lines = []
regions_lines = []

for i in range(1, chunk_rows):
    y = origin_y + i * chunk_dy
    chunks_lines.append([[origin_x, y], [origin_x + width, y]])

for j in range(1, chunk_cols):
    x = origin_x + j * chunk_dx
    chunks_lines.append([[x, origin_y], [x, origin_y + height]])

for k in range(1, region_rows):
    y = origin_y + k * region_dy
    regions_lines.append([[origin_x, y], [origin_x + width, y]])

for l in range(1, region_cols):
    x = origin_x + l * region_dx
    regions_lines.append([[x, origin_y], [x, origin_y + height]])


# Build GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "noPan": 1,
                "color": "#737070",
                "weight": 0.40,
                "opacity": 1,
            },
            "geometry": {
                "type": "MultiLineString",
                "coordinates": chunks_lines
            }
        },
        {
            "type": "Feature",
            "properties": {
                "noPan": 1,
                "color": "#000000",
                "weight": 2,
                "opacity": 1,
            },
            "geometry": {
                "type": "MultiLineString",
                "coordinates": regions_lines
            }
        },
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Calenthyr"}, "geometry": {"type": "Point", "coordinates": [3840, 7680]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Oruvale"}, "geometry": {"type": "Point", "coordinates": [11520, 7680]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Veltrassa"}, "geometry": {"type": "Point", "coordinates": [19200, 7680]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Solvenar"}, "geometry": {"type": "Point", "coordinates": [3840, 15360]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Marundel"}, "geometry": {"type": "Point", "coordinates": [11520, 15360]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Tessavar"}, "geometry": {"type": "Point", "coordinates": [19200, 15360]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Elyvarin"}, "geometry": {"type": "Point", "coordinates": [3840, 23040]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Draxionne"}, "geometry": {"type": "Point", "coordinates": [11520, 23040]}},
        {"type": "Feature", "properties": {"type":"tooltip","noPan": 1,"popupText":"Zepharel"}, "geometry": {"type": "Point", "coordinates": [19200, 23040]}}
    ]
}

# Output to file
with open('static/markers/grids.geojson', 'w') as f:
    json.dump(geojson, f, separators=(',', ':'))