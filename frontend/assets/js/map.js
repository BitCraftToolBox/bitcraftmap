"use strict"

// N = Z = lat = Bottom to top
// E = X = lgt = left to right

const mapOptions = createMapOptions()
const map = L.map('map', mapOptions)

const mapBounds = [[0, 0], [mapOptions.mapHeight, mapOptions.mapWidth]]
map.fitBounds(mapBounds)

const mapImageLayer = L.imageOverlay(
    "assets/maps/map.webp",
    mapBounds,
    {
        pane: 'tilePane'
    }
);
mapImageLayer._isValidTile = function (coords) {
    const tileBounds = mapImageLayer._tileCoordsToBounds(coords)
    return L.latLngBounds(mapBounds).overlaps(tileBounds);
}
mapImageLayer.addTo(map);

// Overwriting the default icon parameters
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    "iconUrl": iconsManifest['Hex_Logo'],
    "iconRetinaUrl": iconsManifest['Hex_Logo'],
    "iconSize": [32, 32],
    "iconAnchor": [16, 16],
    "popupAnchor": [0, -16],
    "tooltipAnchor": [-16, 0],
    "shadowUrl": null,
    "shadowSize": null,
    "shadowAnchor": null,
    "shadowRetinaUrl": null
})

function createIcon(iconName = 'Hex_Logo', iconSize = [32, 32]) {
    const width = iconSize[0] ?? 32
    const height = iconSize[1] ?? 32
    return L.icon({
        iconUrl: iconsManifest[iconName],
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 2],
        popupAnchor: [0, -height / 2],
        shadowUrl: null,
        shadowSize: null,
        shadowAnchor: null
    })
}

const caveIcons = [
    createIcon('t1'), createIcon('t2'), createIcon('t3'), createIcon('t4'), createIcon('t5'),
    createIcon('t6'), createIcon('t7'), createIcon('t8'), createIcon('t9'), createIcon('t10')
]
const ruinedIcon = createIcon('ruinedCity')
const templeIcon = createIcon('temple')
const treeIcon = createIcon('travelerTree')
const hexEnergyIcon = createIcon('hexite-energy')

const treesLayer = L.layerGroup()
const ruinedLayer = L.layerGroup()
const templesLayer = L.layerGroup()
const gridsLayer = L.layerGroup()
const dungeonsLayer = L.layerGroup()
const towersLayer = L.layerGroup()
const waypointsLayer = L.layerGroup()

const searchGroup = L.layerGroup(ruinedLayer)

const caveT1Layer = L.layerGroup()
const caveT2Layer = L.layerGroup()
const caveT3Layer = L.layerGroup()
const caveT4Layer = L.layerGroup()
const caveT5Layer = L.layerGroup()
const caveT6Layer = L.layerGroup()
const caveT7Layer = L.layerGroup()
const caveT8Layer = L.layerGroup()
const caveT9Layer = L.layerGroup()
const caveT10Layer = L.layerGroup()

const caveLayers = [
    caveT1Layer, caveT2Layer, caveT3Layer, caveT4Layer, caveT5Layer,
    caveT6Layer, caveT7Layer, caveT8Layer, caveT9Layer, caveT10Layer
]

const allCaves = L.layerGroup(caveLayers)


const genericToggle = {
    "Wonders": treesLayer,
    "Temples": templesLayer,
    "Ruined Cities": ruinedLayer,
    "Grids": gridsLayer,
    "Dungeons": dungeonsLayer,
    "Towers": towersLayer,
    "Waypoints": waypointsLayer,
    "Caves": allCaves,
    "Caves T1": caveT1Layer,
    "Caves T2": caveT2Layer,
    "Caves T3": caveT3Layer,
    "Caves T4": caveT4Layer,
    "Caves T5": caveT5Layer,
    "Caves T6": caveT6Layer,
    "Caves T7": caveT7Layer,
    "Caves T8": caveT8Layer
}

const resourceLayers = {}

const allLayers = {
    treesLayer, templesLayer, ruinedLayer, waypointsLayer,
    caveT1Layer, caveT2Layer, caveT3Layer, caveT4Layer, caveT5Layer,
    caveT6Layer, caveT7Layer, caveT8Layer, caveT9Layer, caveT10Layer,
    dungeonsLayer, towersLayer
}



// This is leaflet.search plugin configuration
// This plugin need a "title" parameter in each marker to find stuff
const searchControlOptions = {
    position: 'topleft',
    layer: searchGroup,
    initial: false,
    marker: false,
    firstTipSubmit: true,
    zoom: 0
}
const searchControl = new L.Control.Search(searchControlOptions)

// Load the marker if it is no already on the map
searchControl.on('search:locationfound', function (marker) {
    if (!map.hasLayer(marker.layer)) {
        map.addLayer(marker.layer)
    }
})

// -------------------------------------- //
// This is getting replaced
// -------------------------------------- //
async function loadTreesGeoJson() {
    const file = await fetch('assets/markers/trees.geojson')
    const geojsonData = await file.json()
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {

            const coords = readableCoordinates(latlng)
            const name = feature.properties.name + '<br>'
            const loc = 'N ' + coords[0] + ' E ' + coords[1]
            const popupText = name + loc

            return L.marker(
                latlng,
                { icon: feature.properties.type === 'tree' ? treeIcon : hexEnergyIcon }
            )
                .bindPopup(popupText)
                .addTo(treesLayer)
        }
    })
}
async function loadTemplesGeoJson() {
    const file = await fetch('assets/markers/temples.geojson')
    const geojsonData = await file.json()
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {

            const coords = readableCoordinates(latlng)
            const name = feature.properties.name + '<br>'
            const loc = 'N ' + coords[0] + ' E ' + coords[1]
            const popupText = name + loc

            return L.marker(
                latlng,
                { icon: templeIcon }
            )
                .bindPopup(popupText)
                .addTo(templesLayer)
        }
    })
}
async function loadRuinedGeoJson() {
    const file = await fetch('assets/markers/ruined.geojson')
    const geojsonData = await file.json()
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {

            const coords = readableCoordinates(latlng)
            const name = feature.properties.name + '<br>'
            const loc = 'N ' + coords[0] + ' E ' + coords[1]
            const popupText = name + loc

            return L.marker(
                latlng,
                {
                    title: feature.properties.name + ' N ' + coords[0] + ' E ' + coords[1],
                    icon: ruinedIcon
                }
            )
                .bindPopup(popupText)
                .addTo(ruinedLayer)
        }
    })
}

async function loadCavesGeoJson() {
    const file = await fetch('assets/markers/caves.geojson')
    const geojsonData = await file.json()
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {

            const coords = readableCoordinates(latlng)
            const name = feature.properties.name + '<br>'
            const loc = 'N ' + coords[0] + ' E ' + coords[1]
            const popupText = name + loc

            return L.marker(
                latlng,
                { icon: caveIcons[feature.properties.tier - 1] }
            )
                .bindPopup(popupText)
                .addTo(caveLayers[feature.properties.tier - 1])
        }
    })
}

async function loadDungeonsGeoJson() {
    const file = await fetch('assets/markers/dungeons.geojson')
    const geojsonData = await file.json()
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            return L.marker(
                latlng,
                { icon: createIcon(feature.properties.iconName, feature.properties.iconSize) }
            )
                .bindPopup(feature.properties.popupText)
                .addTo(dungeonsLayer)
        }
    });
}

// -------------------------------------- //
// This is getting replaced
// -------------------------------------- //

// Function to convert to N E coordinate people know about
function readableCoordinates(latlng) {
    return [Math.round(latlng.lat / 3), Math.round(latlng.lng / 3)]
}

// Bit of code to get the position at the mouse and display it
map.on('mousemove', function (e) {
    const coordDisplay = document.getElementById('coords')
    const coords = readableCoordinates(e.latlng)
    coordDisplay.innerText = 'N: ' + coords[0] + ' E: ' + coords[1]
})

function loadGeoJsonFromHash() {
    const hashFromUrl = location.hash.slice(1)
    if (!hashFromUrl) return
    const geoJson = validateGeoJson(hashFromUrl)
    paintGeoJson(geoJson, waypointsLayer)
    map.addLayer(waypointsLayer)
}

async function loadGeoJsonFromFile(fileUrl, layer) {
    const file = await fetch(fileUrl)
    const content = await file.text()
    const geoJson = validateGeoJson(content)
    if (Array.isArray(geoJson)) {
        geoJson.map(child => paintGeoJson(child, layer))
    } else {
        paintGeoJson(geoJson, layer)
    }
}

function paintGeoJson(geoJson, layer, pan = true) {
    // Handle flyTo/zoomTo/turnLayerOn/turnLayerOff for features with null geometry (Leaflet won't process them)
    if (geoJson?.features) {
        for (const feature of geoJson.features) {
            if (!feature.geometry) {
                // Handle turnLayerOn
                if (feature.properties?.turnLayerOn) {
                    if (Array.isArray(feature.properties.turnLayerOn)) {
                        for (const layerName of feature.properties.turnLayerOn) {
                            const layer = allLayers[layerName]
                            if (layer) map.addLayer(layer)
                        }
                    } else {
                        const layer = allLayers[feature.properties.turnLayerOn]
                        if (layer) map.addLayer(layer)
                    }
                }

                // Handle turnLayerOff
                if (feature.properties?.turnLayerOff) {
                    if (Array.isArray(feature.properties.turnLayerOff)) {
                        for (const layerName of feature.properties.turnLayerOff) {
                            const layer = allLayers[layerName]
                            if (layer) map.removeLayer(layer)
                        }
                    } else {
                        const layer = allLayers[feature.properties.turnLayerOff]
                        if (layer) map.removeLayer(layer)
                    }
                }

                // Handle flyTo/zoomTo
                if (pan && !feature.properties?.noPan) {
                    if (feature.properties?.flyTo && feature.properties?.zoomTo != null) {
                        map.flyTo(feature.properties.flyTo, feature.properties.zoomTo)
                    } else if (feature.properties?.zoomTo != null) {
                        const zoomLevel = feature.properties.zoomTo
                        const center = map.getCenter()
                        if (center && center.isValid && center.isValid()) {
                            map.flyTo(center, zoomLevel)
                        } else {
                            map.setZoom(zoomLevel)
                        }
                    }
                }
            }
        }
    }

    L.geoJSON(geoJson, {
        pointToLayer: function (feature, latlng) {

            if (feature.properties?.type === 'tooltip') {
                return new L.popup(
                    latlng,
                    { autoPan: false, autoClose: false }
                ).setContent(feature.properties.popupText)
            }

            if (feature.properties?.makeCanvas) {
                if (feature.properties?.radius) {
                    return new L.CircleMarker(latlng, { radius: feature.properties.radius })
                } else {
                    return new L.CircleMarker(latlng, { radius: 1 })
                }
            }

            map.createPane('markerOnTop')
            map.getPane('markerOnTop').style.zIndex = 980

            map.createPane('popupOnTop')
            map.getPane('popupOnTop').style.zIndex = 990


            let waypointIcon
            if (feature.properties?.iconName || feature.properties?.iconSize) {
                waypointIcon = createIcon(feature.properties.iconName, feature.properties.iconSize)
            } else {
                waypointIcon = createIcon('waypoint')
            }

            return L.marker(
                latlng,
                { icon: waypointIcon, pane: 'markerOnTop' }
            )
        },

        style: function (feature) {
            return {
                color: feature.properties?.color || "#000000", // outline color // eh, lets always gave a black border and override if needed
                fillColor: feature.properties?.fillColor || "#3388ff", // fill color                   
                radius: 4, // colored dot size
                weight: feature.properties?.weight || 1, // outline width
                opacity: feature.properties?.opacity || 1,
                fillOpacity: feature.properties?.fillOpacity ?? 1
            }
        },

        onEachFeature: function (feature, layer) {
            if (feature.properties?.popupText) {
                const popupText = feature.properties.popupText
                let finalPopupText = ''

                if (Array.isArray(popupText)) {
                    for (const line of popupText) {
                        finalPopupText += line + '<br>'
                    }
                } else {
                    finalPopupText = popupText
                }
                layer.bindPopup(finalPopupText, { pane: 'popupOnTop' })
            }

            if (feature.properties?.turnLayerOn) {
                if (Array.isArray(feature.properties.turnLayerOn)) {
                    for (const layerName of feature.properties.turnLayerOn) {
                        const layer = allLayers[layerName]
                        if (layer) map.addLayer(layer)
                    }
                } else {
                    const layer = allLayers[feature.properties.turnLayerOn]
                    if (layer) map.addLayer(layer)
                }
            }

            if (feature.properties?.turnLayerOff) {
                if (Array.isArray(feature.properties.turnLayerOff)) {
                    for (const layerName of feature.properties.turnLayerOff) {
                        const layer = allLayers[layerName]
                        if (layer) map.removeLayer(layer)
                    }
                } else {
                    const layer = allLayers[feature.properties.turnLayerOff]
                    if (layer) map.removeLayer(layer)
                }
            }

            if (
                feature.properties?.flyTo
                && feature.properties?.zoomTo != null
                && !feature.properties.noPan
                && pan) {
                map.flyTo(feature.properties.flyTo, feature.properties.zoomTo)
            } else if (
                feature.properties?.zoomTo != null
                && !feature.properties.noPan
                && pan) {
                map.flyTo(map.getCenter(), feature.properties.zoomTo)
            } else if (
                layer?.getBounds
                && layer?.getBounds().isValid()
                && !feature.properties.noPan
                && pan) {
                map.fitBounds(layer.getBounds())
            }
        }
    }).addTo(layer)
}

// Default layer to show on map opening
treesLayer.addTo(map)
templesLayer.addTo(map)
ruinedLayer.addTo(map)
searchControl.addTo(map)

const controlLayer = L.control.layers(null, genericToggle, { collapsed: false }).addTo(map)

function groupLayersControl(control, groups) {
    const root = control._overlaysList
    const labels = [...root.querySelectorAll('label')]
    const byName = Object.fromEntries(labels.map(l => [l.textContent.trim(), l]))
    root.innerHTML = ''

    // Track which items are grouped (include group names like "Claims", "Caves" which are master toggles)
    const groupedNames = new Set([...Object.values(groups).flat(), ...Object.keys(groups)])

    for (const [title, names] of Object.entries(groups)) {
        const section = L.DomUtil.create('details', 'lc-section', root)
        const summary = L.DomUtil.create('summary', 'lc-summary', section)

        // Colapse all but poi
        if (!['Claims', 'Caves'].includes(title)) {
            section.open = true
        }

        // master checkbox
        const master = L.DomUtil.create('input', '', summary)
        master.type = 'checkbox'
        summary.appendChild(document.createTextNode(title))

        const list = L.DomUtil.create('div', 'lc-list', section)
        const children = names.map(n => byName[n]).filter(Boolean)
        children.forEach(el => list.appendChild(el))

        // Select and deselect checkboxes when you click on the master checkbox
        master.addEventListener('change', () => {
            const anyChecked = children.some(el => el.querySelector('input').checked)
            if (anyChecked) {
                // if any child is checked → click all checked ones to deselect
                children.forEach(el => {
                    const cb = el.querySelector('input[type=checkbox]')
                    if (cb.checked) el.click()
                })
            } else {
                // if none checked → click all to select
                children.forEach(el => el.click())
            }
        })

        // keep master synced with children
        children.forEach(el => {
            const cb = el.querySelector('input[type=checkbox]')
            cb.addEventListener('change', () => {
                const all = children.every(c => c.querySelector('input').checked)
                const none = children.every(c => !c.querySelector('input').checked)
                master.indeterminate = !(all || none)
                master.checked = all
            })
        })
    }

    // Add ungrouped items at the bottom (like Roads)
    for (const [name, label] of Object.entries(byName)) {
        if (!groupedNames.has(name)) {
            root.appendChild(label)
        }
    }
}

function validateGeoJson(untrustedString, unwrapped = false) {
    let jsonFormString
    if (!unwrapped) {
        if (untrustedString.constructor.name !== 'String') {
            throw new Error('untrustedString be a string')
        }

        let decodedString
        try {
            decodedString = decodeURIComponent(untrustedString)
        } catch {
            throw new Error('Bad URI encoding')
        }

        try {
            jsonFormString = JSON.parse(decodedString)
        } catch {
            throw new Error('Invalid JSON')
        }
    } else {
        jsonFormString = untrustedString
    }
    if (Array.isArray(jsonFormString)) {
        return jsonFormString.map((geoJson) => validateGeoJson(geoJson, true))
    }

    if (jsonFormString.type !== 'FeatureCollection') {
        throw new Error('geoJson doesnt have FeatureCollection')
    }

    if (!jsonFormString.features || !Array.isArray(jsonFormString.features)) {
        throw new Error('geoJson doesnt have features or features isnt array')
    }

    for (const feature of jsonFormString.features) {

        if (feature.properties?.iconName) {
            // iconName must be a string
            if (feature.properties.iconName.constructor.name !== 'String') {
                feature.properties.iconName = 'waypoint'
            }

            // iconName must be present in the iconsManifest list
            if (feature.properties.iconName in iconsManifest === false) {
                feature.properties.iconName = 'waypoint'
            }
        }

        if (feature.properties?.iconSize) {
            // Check if icon size is an array 
            if (!Array.isArray(feature.properties.iconSize)) {
                feature.properties.iconSize = [32, 32]
            }

            // Icon size need to be an array of length 2
            if (feature.properties.iconSize.length !== 2) {
                feature.properties.iconSize = [32, 32]
            }

            // Check if we have numbers in the array
            if (!feature.properties.iconSize.every(value => value.constructor.name === 'Number')) {
                feature.properties.iconSize = [32, 32]
            }
        }

        if (feature.properties?.popupText) {
            if (
                Array.isArray(feature.properties.popupText)
                && feature.properties.popupText.every(
                    value => value.constructor.name === 'String'
                )
            ) {
                feature.properties.popupText = feature.properties.popupText.map(escapeHTML)
            } else if (feature.properties.popupText.constructor.name === 'String') {
                feature.properties.popupText = escapeHTML(feature.properties.popupText)
            } else {
                throw new Error('popupText must be string or array of strings')
            }
        }
    }
    return jsonFormString
}

// Load files
loadTreesGeoJson()
loadTemplesGeoJson()
loadRuinedGeoJson()
loadCavesGeoJson()
loadDungeonsGeoJson()
loadGeoJsonFromFile('assets/markers/towers.geojson', towersLayer)

// load from hash
loadGeoJsonFromHash()

// Load only when the user is requesting it
gridsLayer.once('add', () => loadGeoJsonFromFile('assets/markers/grids.geojson', gridsLayer))


const GROUPS = {
    'Points of Interest': ['Wonders', 'Temples', 'Ruined Cities', 'Grids', 'Dungeons', 'Waypoints'],
    'Caves': ['Caves T1', 'Caves T2', 'Caves T3', 'Caves T4', 'Caves T5', 'Caves T6', 'Caves T7', 'Caves T8'],
}

const _origUpdate = controlLayer._update.bind(controlLayer)
controlLayer._update = function () {
    const prevOpen = {}
    if (this._overlaysList) {
        this._overlaysList
            .querySelectorAll('details.lc-section')
            .forEach(d => {
                const key = d.querySelector('summary')?.textContent.trim()
                if (key) prevOpen[key] = d.open
            })
    }

    _origUpdate()
    groupLayersControl(this, GROUPS)

    this._overlaysList
        .querySelectorAll('details.lc-section')
        .forEach(d => {
            const key = d.querySelector('summary')?.textContent.trim()
            if (key && prevOpen.hasOwnProperty(key)) d.open = prevOpen[key]
        })
}

groupLayersControl(controlLayer, GROUPS)


const liveLayer = L.featureGroup().addTo(map)
const playerStore = new Map()
const destinationStore = new Map()

function updateMarker(state, followPlayer) {

    const playerId = state.entity_id
    const playerlatLng = L.latLng(state.location_z / 1000, state.location_x / 1000)
    const destinationlatLng = L.latLng(state.destination_z / 1000, state.destination_x / 1000)
    const directionLine = [playerlatLng, destinationlatLng]

    const playerMarker = playerStore.get(playerId) || false
    const playerDestination = destinationStore.get(playerId) || false


    if (!playerMarker || !playerDestination) {
        const playerMarker = new L.circleMarker(playerlatLng, {
            color: '#00ff00ff',
            radius: 4,
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        }).addTo(liveLayer)
        playerMarker.bindPopup("PlayerId: " + playerId)

        const playerTrail = new L.Polyline(directionLine, {
            color: '#ff0000ff',
            weight: 1,
            opacity: 1,
            smoothFactor: 1
        }).addTo(liveLayer)

        playerStore.set(playerId, playerMarker)
        destinationStore.set(playerId, playerTrail)
    } else {
        playerMarker.setLatLng(playerlatLng)
        playerDestination.setLatLngs(directionLine)
    }
    if (followPlayer) {
        map.flyTo(playerlatLng, map.getZoom())
    }
}

// grab default map postion and zoom
const defaultCenter = map.getCenter();
const defaultZoom = map.getZoom();

// Check if hash has flyTo or zoomTo - if so, skip localStorage restore so they take priority
const hashFromUrl = location.hash.slice(1)
const hasHashWithFlyToOrZoom = hashFromUrl && (() => {
    try {
        const geoJson = JSON.parse(decodeURIComponent(hashFromUrl))
        return geoJson?.features?.some(f =>
            (f.properties?.flyTo && f.properties?.zoomTo != null) ||
            f.properties?.zoomTo != null
        )
    } catch { return false }
})()


// Restore saved state if exists (but skip if hash has flyTo)
const savedCenter = localStorage.getItem('mapCenter');
const savedZoom = localStorage.getItem('mapZoom');

if (savedCenter && savedZoom && !hasHashWithFlyToOrZoom) { // set the state
    const centerCoords = JSON.parse(savedCenter);
    const zoomLevel = parseFloat(savedZoom, 10);
    map.setView(centerCoords, zoomLevel);
}

map.on('moveend', () => { // Save map state on move or zoom
    const center = map.getCenter();
    localStorage.setItem('mapCenter', JSON.stringify([center.lat, center.lng]));
    localStorage.setItem('mapZoom', map.getZoom());
});

function reset_view() { // Reset view if lost too far
    map.setView(defaultCenter, defaultZoom);
    localStorage.setItem('mapCenter', JSON.stringify(defaultCenter));
    localStorage.setItem('mapZoom', defaultZoom);
}

// Button to reset map view
document.getElementById('reset_view').addEventListener('click', reset_view);