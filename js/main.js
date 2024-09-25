window.onload = init;

function init() {
    const mapElement = document.getElementById('map')

    // Basemaps
    const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy;  National Geographic, Esri',
        maxZoom: 20
    });
    const Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri; Source: Esri'
    });
    
    // Map element
    const map = L.map(mapElement, {
        center:[39.7,7],
        zoom:5,
        layers: [Esri_WorldStreetMap ]
    })

    // Basemap Layers
    const baseMaps = {
        "<b>Streets</b>": Esri_WorldStreetMap,
        "National Geo": Esri_NatGeoWorldMap,
    };

    const overlayLayers ={}
    
    // Layer Control
    var layerControl = L.control.layers(baseMaps, overlayLayers,{
        collapsed:false,
    }).addTo(map);

    // Add GeoJSON data
    function addGeoJSONData(geojson,legendName,addTo){
        let geoJSONData = L.geoJSON(geojson,{
            pointToLayer: function(feature, latlng){
                return L.circleMarker(latlng,stylePoints(feature))
            },
            style: function(feature){
                if(feature.geometry.type == 'MultiPolygon'){
                    return stylePolys(feature)
            }},
            onEachFeature: function(feature, layer){
                if(feature.geometry.type == 'Point'){
                    layer.bindPopup('<b>'+feature.properties.Title+'</b>'+ '<br>'+'Roman Strength: '+feature.properties.Roman_Strength.toLocaleString()+ '<br>'+'Carthaginian Strength: '+feature.properties.Carthaginian_Strength.toLocaleString()+ '<br>'+'Date: '+feature.properties.Date+ '<br>'+'<b>Result: '+feature.properties.Result+'</b>');
                    layer.on('mouseover',function(e){
                        layer.setStyle(hoverStyle)  
                    });
                    layer.on('mouseout',function(e){
                        layer.setStyle(stylePoints(feature))
                    })
                    layer.bindTooltip(feature.properties.Title, {permanent: true, 
                        direction: "top",
                        className: "my-labels"}).openTooltip();
                }
            }
        })
        layerControl.addOverlay(geoJSONData,legendName)
        if(addTo == 'Yes'){
            geoJSONData.addTo(map)
        }
    }

    // Fetch GeoJSON data
    function fetchGeoJSON(data,legendName,addTo){
        fetch(data)
        .then(function(response) {
            return response.json()
        })
        .then(function(data) {
            addGeoJSONData(data,legendName,addTo);
        })
        .catch(function(error) {
            console.log(`This is the error: ${error}`)
        })
    }

    // Create data layers
    territoryLayer=fetchGeoJSON('./data/territories.json','Territories (Pre-War)','Yes')
    postterritoryLayer=fetchGeoJSON('./data/territories_post.json','Territories (Post-War)',)
    battlesLayer = fetchGeoJSON('./data/battles.json','Battles','Yes')

    function stylePoints(feature){
        if (feature.properties.Result == 'Roman victory'){
            return {
                radius:7, 
                color:'darkred',
                weight:2,
                fillColor:'darkred',
                fillOpacity:0.5
            }
        } else {
            return {
                radius:7, 
                color:'blue',
                weight:2,
                fillColor:'blue',
                fillOpacity:0.5
            }
        }
        
    }
    
    // Styles
    function stylePolys(feature){
        if (feature.properties.Territory == 'Rome'){
            return {
                radius:7, 
                color:'darkred',
                weight:2,
                fillColor:'darkred',
                fillOpacity:0.1
            }
        } else {
            return {
                radius:7, 
                color:'blue',
                weight:2,
                fillColor:'blue',
                fillOpacity:0.1
            }
        }
        
    }
    const hoverStyle = {
        radius:7, 
        color:'yellow',
        weight:2,
        fillColor:'yellow',
        fillOpacity:0.5
    }

    // Legend
    const legend = L.control.Legend({
        position: "bottomleft",
        collapsed: false,
        symbolWidth: 20,
        opacity: 1,
        column: 2,
        legends: [{
            label: "Roman Territory",
            type: "polygon",
            sides: 4,
            color: "darkred",
            weight: 1
        },{
            label: "Roman Victory",
            type: "circle",
            radius: 6,
            color: "darkred",
            fillColor: "darkred",
            fillOpacity: 0.5,
            weight: 2,
        },
        {
            label: "Carthaginian Territory",
            type: "polygon",
            sides: 4,
            color: "blue",
            weight: 1
        },{
            label: "Carthaginian Victory",
            type: "circle",
            radius: 6,
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.5,
            weight: 2,
        }
    ]
    })
    .addTo(map);

}
