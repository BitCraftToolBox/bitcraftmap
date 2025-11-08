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

function createAppOptions() {
    return {
        backendUrl: "https://api.bitcraftmap.com/",
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

// Aytimothy colors
const tierColors = [
    "#636a74ff", "#865f45ff", "#5c6f4dff", "#49619bff", "#804f86ff",
    "#973a44ff", "#937014ff", "#538383ff", "#464953ff", "#96aebdff"
]
const brighterTierColors = [
    "#838e9eff", "#a8663aff", "#729b53ff", "#3a63c4ff", "#a349afff",
    "#bd2c3bff", "#c09015ff", "#46a1a1ff", "#4f5361ff", "#81b6d6ff"
]