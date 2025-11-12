"use strict"
// Generic options for the map. See https://leafletjs.com/reference.html#map-option
function createMapOptions() {

    // Bitcraft specific options
    const apothem = 2 / Math.sqrt(3)
    const mapWidth = 23040
    const mapHeight = 23040
    const mapImageURL = 'assets/maps/map.webp'

    return {
        apothem,
        mapWidth,
        mapHeight,
        mapImageURL,

        // Rendering
        preferCanvas: true,
        zoomAnimation: false,

        // Controls
        attributionControl: false,  // Remove Leaflet Watermark
        zoomControl: false,         // Remove the zoom control top left
        boxZoom: false,             // Feature to zoom by creating a box

        // Map state options
        minZoom: -5,
        maxZoom: 5,
        zoomSnap: 0.1,

        // This is a custom CRS (Coordinate Reference System) that fit bitcraft special hex grid
        crs: L.extend({}, L.CRS.Simple, {
            projection: {
                project(latlng) {
                    return new L.Point(latlng.lng, -latlng.lat / apothem)
                },
                unproject(point) {
                    return new L.LatLng(-point.y * apothem, point.x)
                },
                bounds: L.bounds([0, 0], [mapWidth, mapHeight])
            },
            transformation: new L.Transformation(1, 0, 1, 0),
            scale(z) {
                return Math.pow(2, z)
            },
            infinite: false
        }),

        // Options that I'm not sure about
        // zoomSnap
        // zoomDelta
        // inertia
        // inertiaDeceleration
        // inertiaMaxSpeed
        // easeLinearity
        // maxBoundsViscosity
        // tapHold
        // tapTolerance
        // touchZoom
        // bounceAtZoomLimits
        // zoomAnimationThreshold
        // fadeAnimation
        // markerZoomAnimation
        // transform3DLimit
        // layers
        // maxBounds
        // renderer
    }
}

function createAppOptions() { // is anything even using that function?
    return {
        backendUrl: "https://bcmap-api.bitjita.com", 
        gistApi: "https://api.github.com/gists/"
    }
}

// Hold default config resource/id -> formating
function createResourceStyle() {
    return {

    }
}

// Hold default config enemy/id -> formating
function createEnemyStyle() {
    return {

    }
}

// Script generated list of icons for markers
function createIconsManifest() {
    return {

    }
}

// huge object to tell how to format something, color, text..
// The user might want to change these parameters dynamically
// We need to generate it
const formating = {
    "resource_2": { "tier": 1, "popupText": "something", "rendering": "markers or canvas ?" },
    "enemy_2": { "tier": 1, "popupText": "name", "rendering": "markers or canvas ?" },
    // need one line for each resource and enemy...

    // What other types ?
    // Claims
    // wonders
    // ruined cities
    // Caves
    // Dungeons
}

// wiz tier colors
const tierColors = {
    0: "#413A64",
    1: "#636A74",
    2: "#875F45",
    3: "#5C6F4D",
    4: "#49619C",
    5: "#814F87",
    6: "#983A44",
    7: "#947014",
    8: "#538484",
    9: "#464953",
    10: "#97AFBE",
}
const brighterTierColors = [
    "#838e9eff", "#a8663aff", "#729b53ff", "#3a63c4ff", "#a349afff",
    "#bd2c3bff", "#c09015ff", "#46a1a1ff", "#4f5361ff", "#81b6d6ff"
]

