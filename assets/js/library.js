"use strict"
// This is the layer registry, all layers will be stored in there
// Also have the functions to show and hide layers
function createLayerRegistry(leafletMap) {
    const layerStore = new Map()
    const layerFactories = new Map([
        ["group", options => L.layerGroup([], options)],
        ["feature", options => L.featureGroup([], options)],
        ["geojson", options => L.geoJSON(null, options)],
        ["tile", options => L.tileLayer(options.url, options)],
        ["canvas", options => L.canvas(options)],
        ["svg", options => L.svg(options)],
        ["imageOverlay", options => L.imageOverlay(options.url, options.bounds)],
    ])

    /**
     * Check if a layer exists in the registry
     * @param {string} layerName - The unique layer name
     * @returns {boolean} true if the layer exists, false otherwise
     */
    function hasLayer(layerName) {
        return layerStore.has(layerName)
    }


    /**
     * Retrieve a layer instance from the registry
     * @param {string} layerName - The unique layer name
     * @returns {L.Layer|null} The Leaflet layer instance or null if not found
     */
    function getLayer(layerName) {
        return layerStore.get(layerName) || null
    }

    /**
     * List all registered layer names
     * @returns {string[]} An array of layer names
     */
    function getLayersNames() {
        return [...layerStore.keys()]
    }

    /**
     * Filter layers by Leaflet constructor (for example L.LayerGroup)
     * @param {Function} constructorFunction - Leaflet class/constructor to check against
     * @param {boolean} [onlyNames=true] - If true return only names, otherwise return objects {name, layer}
     * @returns {Array<string>|Array<{name: string, layer: L.Layer}>}
     */
    function getLayersByType(constructorFunction, onlyNames = true) {
        const matchingLayers = []
        for (const [currentName, currentLayer] of layerStore.entries()) {
            if (currentLayer instanceof constructorFunction) {
                if (onlyNames) {
                    matchingLayers.push(currentName)
                } else {
                    matchingLayers.push({
                        name: currentName,
                        layer: currentLayer
                    })
                }
            }
        }
        return matchingLayers
    }

    /**
     * Create a new layer or reuse an existing one
     * @param {string} layerName - The unique layer name
     * @param {string} [layerType="group"] - The type of layer ("group", "geojson", "tile", etc.)
     * @param {object} [options={}] - Options to pass to the layer factory
     * @param {boolean} [addToMap=true] - Whether to immediately add the layer to the map
     * @returns {L.Layer} The created or existing Leaflet layer
     */
    function createLayer(layerName, layerType = "group", options = {}, addToMap = true) {
        if (layerStore.has(layerName)) {
            const leafletLayer = layerStore.get(layerName)
            if (addToMap && leafletMap) leafletMap.addLayer(leafletLayer)
            return layerStore.get(layerName)
        }
        let layerFactory = layerFactories.get(layerType)
        if (!layerFactory) layerFactory = layerFactories.get("group")
        const leafletLayer = layerFactory(options)
        layerStore.set(layerName, leafletLayer)
        if (addToMap && leafletMap) leafletMap.addLayer(leafletLayer)
        return leafletLayer
    }

    /**
     * Delete a layer from registry and from the map
     * @param {string} layerName - The unique layer name
     * @returns {boolean} true if the layer was deleted, false otherwise
     */
    function deleteLayer(layerName) {
        const leafletLayer = layerStore.get(layerName)
        if (!leafletLayer) return false
        if (leafletMap && leafletMap.hasLayer(leafletLayer)) leafletMap.removeLayer(leafletLayer)
        return layerStore.delete(layerName)
    }

    /**
     * Show a layer (add it to the map if registered)
     * @param {string} layerName - The unique layer name
     * @returns {boolean} true if the layer is now visible, false otherwise
     */
    function showLayer(layerName) {
        const leafletLayer = getLayer(layerName)
        if (!leafletLayer || !leafletMap) return false
        if (leafletMap.hasLayer(leafletLayer)) return true
        leafletMap.addLayer(leafletLayer)
        return true
    }

    /**
     * Hide a layer (remove it from the map but keep in registry)
     * @param {string} layerName - The unique layer name
     * @returns {boolean} true if the layer is now hidden, false otherwise
     */
    function hideLayer(layerName) {
        const leafletLayer = getLayer(layerName)
        if (!leafletLayer || !leafletMap) return false
        if (!leafletMap.hasLayer(leafletLayer)) return true
        leafletMap.removeLayer(leafletLayer)
        return true
    }

    /**
     * Toggle visibility of a layer
     * @param {string} layerName - The unique layer name
     * @returns {boolean} true if the layer is now visible, false if hidden
     */
    function toggleLayer(layerName) {
        const leafletLayer = getLayer(layerName)
        if (!leafletLayer || !leafletMap) return false
        if (isLayerVisible(layerName)) {
            hideLayer(layerName)
        } else {
            showLayer(layerName)
        }
    }


    /**
     * Check if a layer is currently visible on the map
     * @param {string} layerName - The unique layer name
     * @returns {boolean} true if the layer is visible, false otherwise
     */
    function isLayerVisible(layerName) {
        const leafletLayer = getLayer(layerName)
        if (!leafletLayer || !leafletMap) return false
        return leafletMap.hasLayer(leafletLayer)
    }

    // TODO Bulk functions 
    function showLayers() { }
    function hideLayers() { }

    return {
        hasLayer,
        getLayer,
        getLayersNames,
        getLayersByType,
        createLayer,
        deleteLayer,
        showLayer,
        hideLayer,
        toggleLayer,
        isLayerVisible
    }
}


function renderGeoJsonToLayer(validGeoJson, layerName) {

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
                color: feature.properties?.color || "#3388ff",
                weight: feature.properties?.weight || 3,
                opacity: feature.properties?.opacity || 1,
                fillColor: feature.properties?.fillColor || "#3388ff",
                fillOpacity: feature.properties?.fillOpacity ?? 0.2
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
                && feature.properties?.zoomTo
                && !feature.properties.noPan) {
                map.flyTo(feature.properties.flyTo, feature.properties.zoomTo)
            } else if (
                layer?.getBounds
                && layer?.getBounds().isValid()
                && !feature.properties.noPan) {
                map.fitBounds(layer.getBounds())
            }
        }
    }).addTo(layer)
}

// Calculate the distance between 2 points
function calculateFlightDistance(pointA, pointB) {

}


// Function to build an icon from an ensemble of other icons
// for example when when need to make it in function of parameters (ex : watchtower under siege or not)
function composeIconImage() {

}

// Will take in GeoJson and a config object, then will add in style like colors, if it need to make markers or canva...
// We will need to build an extensive config object from the desc files
function composeGeoJson(validGeoJson, formating) {

}