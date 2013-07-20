var osmUrl= 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib= '';
var osm = new L.TileLayer(osmUrl, {minZoom: 11, maxZoom: 17, attribution: osmAttrib});

var mapRegions;
var recifeCoords = new L.LatLng(-8.05428, -34.8813);

function createMapRegions(){
    mapRegions = new L.map('mapRegions');
    mapRegions.on('resize', function(){
        mapRegions.invalidateSize();
    });
    mapRegions.addLayer(osm);
    mapRegions.setView(recifeCoords, 12);

    $.getJSON('db/postos.json', function(json){
        var html = "Posto Pluviométrico<br>";
        for(var i = 0; i < json.length; i++)
            L.marker([json[i].lat, json[i].lng]).addTo(mapRegions).bindPopup(html + json[i].title);
    });
    $.getJSON('db/bairros.geojson', function(json){
        L.geoJson(json, {
            onEachFeature: function(feature, layer){
                var html = "";
                html += "Bairro: " + feature.properties.bairro_nome;
                html += "<br>";
                html += "Região: " + getRPA(feature.properties.rpa);
                layer.bindPopup(html);
                layer.setStyle({color: getRPAColor(feature.properties.rpa), weight: 3});
            }
        }).addTo(mapRegions);
        mapRegions.invalidateSize();
    });
}

function resetMap(){
    $('#mapRegions').css("height", ($(window).height() - 45)); 
    try {
        //mapRegions.setView(recifeCoords, 12);
        //mapRegions.invalidateSize();
    } catch(e) { }
}

function getRPA(rpa){
    switch(rpa){
        case 1: return "Centro";
        case 2: return "Norte";
        case 3: return "Nordeste";
        case 4: return "Oeste";
        case 5: return "Sudeste";
        case 6: return "Sul";
        default: return "";
    }
}

function getRPAColor(rpa){
    switch(rpa){
        case 1: return "#2e00ff";
        case 2: return "#00f2ff";
        case 3: return "#27d800";
        case 4: return "#e2ea00";
        case 5: return "#ff9000";
        case 6: return "#ff0000";
        default: return "#FFF";
    }
}

$(document).on('pagebeforecreate', '#pageRegions', function(e, data){
    $.mobile.loading('show');
});
$(document).on('pageinit', '#pageRegions', function(e, data){
    createMapRegions();
});