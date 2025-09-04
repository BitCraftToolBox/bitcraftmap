'use strict';

// Generic option for the website map
function createMapOptions(config) {
    return {
        mapId : config.mapId ?? "map",
        apothem : 2 / Math.sqrt(3),

        bitcraftWidth : config.width ?? 23040,
        bitcraftHeight : config.height ?? 23040,
        bitcraftHeightWithOcean : bitcraftHeight * apothem,
        center : config.center ?? [bitcraftWidth/2, bitcraftHeight/2],

        zoom : config.zoom ?? 3,

        minZoom : config.minZoom ?? 0,
        maxZoom : config.maxZoom ?? 18,

        crs : config.crs ?? L.CRS.Simple,
        attribution : config.attribution ?? false,
    };
}


function createRenderingOptions() {
    return {

    };
}

function createIconsManifest() {
    return {

    };
}



// This maybe not in config.js
function createBitcraftProjection(LeafletObject, apothem) {
    return {
        project(latlng) {
            return new LeafletObject.Point(latlng.lng, -latlng.lat / apothem);
        },
        unproject(point) {
            return new LeafletObject.LatLng(-point.y * apothem, point.x);
        },
        bounds: LeafletObject.bounds([-Infinity, -Infinity], [Infinity, Infinity])
    };
}