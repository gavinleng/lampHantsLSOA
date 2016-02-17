/*
 * Created by G on 10/02/2016.
 */


var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 20 });

var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 });

var map = L.map('map', {
    layers: [layer],
    center: [51.0, -1.3],
    zoom: 10
});

map.attributionControl.setPrefix('');

//Extend the Default marker class
var MyIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/circle-outline-16.png'
    }
});

var myIcon1 = new MyIcon({
    iconSize: [8, 8]
});

L.control.scale().addTo(map);

var hoodsMapData = L.geoJson(hoodsData, {
    style: function(feature) {
        return {
            "weight": 1
        };
    },

    onEachFeature: function(feature, layer) {
        layer.on("dblclick", function(e) {
            hoodsMapData.eachLayer(function(layer) {
                hoodsMapData.resetStyle(layer);
            });

            layer.setStyle({
                fillColor: '#3f0',
                color: '#0f0'
            });

            var layerbbox = layer.getBounds();

            $("input,.search-input").prop("value", feature.properties.LSOA11CD);

            L.popup()
                .setLatLng(layerbbox.getCenter())
                .setContent("<strong>" + feature.properties.LSOA11CD + "<br>" + feature.properties.LSOA11NM + "</strong>")
                .openOn(map);

            lampLSOA(feature.properties.LSOA11CD, layerbbox);
        }).on("click", function(e) {
            hoodsMapData.eachLayer(function(layer) {
                hoodsMapData.resetStyle(layer);
            });
        });
    }
}).addTo(map);

var searchControl = new L.Control.Search({
    layer: hoodsMapData,
    propertyName: 'LSOA11CD',
    circleLocation: false,
    collapsed: false
}).addTo(map);

searchControl.on('search_locationfound', function(e) {
    hoodsMapData.eachLayer(function(layer) {
        hoodsMapData.resetStyle(layer);
    });

    e.layer.setStyle({
        fillColor: '#3f0',
        color: '#0f0'
    });

    var layerbbox = e.layer.getBounds();

    L.popup()
        .setLatLng(layerbbox.getCenter())
        .setContent("<strong>" + e.layer.feature.properties.LSOA11CD + "<br>" + e.layer.feature.properties.LSOA11NM + "</strong>")
        .openOn(map);

    lampLSOA(e.layer.feature.properties.LSOA11CD, layerbbox);
});

$("input,.search-input").prop("placeholder", "E010...");

L.control.layers({
    'Dark': layer,
    "OSM": osm
}, {
    "LSOA": hoodsMapData
}, {
    collapsed: true
}).addTo(map);

function popUp(f, l) {
    var out = [];
    if (f.properties) {
        for (key in f.properties) {
            out.push(key + ": " + f.properties[key]);
        }
        l.bindPopup(out.join("<br />"));
    }
}

function clean_map() {
    map.eachLayer(function(layer) {
        if ((layer instanceof L.GeoJSON) && (layer != hoodsMapData)) {
            map.removeLayer(layer);
        }
    });
}

function lampLSOA(ecode, bbox) {
    clean_map();

    var ecode = { ecode: ecode };

    $.post('/lampMapData/', ecode, function(data) {
        L.geoJson(data, {
            onEachFeature: popUp,
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {
                    icon: myIcon1
                });
            }
        }).addTo(map);

        map.fitBounds(bbox);
    });
}
