
let map = 0;
var markers = {};


// Load the configuration from config.json
fetch('config.json')
    .then((response) => response.json())
    .then((config) => {
        // Access the Mapbox access token from the loaded configuration
        const mapboxAccessToken = config.mapboxKey;

        // Now you can use mapboxAccessToken in the map initialization
        init(mapboxAccessToken);
    })
    .catch((error) => {
        console.error('Error loading configuration:', error);
    });


// Load map
function init(mapboxAccessToken) {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-77.03658537016716, 38.89872915377276],
        zoom: 14,
        accessToken: mapboxAccessToken,
    });

    addMarkers();
}

// Add bus markers to map
async function addMarkers() {
    // Get bus data
    var busPositions = await getBusLocations();

    // Loop through data, add bus markers
    busPositions.forEach(function (bus) {
        var marker = getMarker(bus.VehicleID);
        if (marker) {
            moveMarker(marker, bus);
        } else {
            addMarker(bus);
        }
    });

    // Timer
    console.log(new Date());
    setTimeout(addMarkers, 15000);
}

// Request bus data from WMATA
async function getBusLocations() {
    var url = 'https://api.wmata.com/Bus.svc/json/jBusPositions?RouteID=70';
    var headers = {
        'api_key': 'e13626d03d8e4c03ac07f95541b3091b'
    };

    var response = await fetch(url, {
        headers: headers
    });

    var json = await response.json();
    return json.BusPositions;
}

function addMarker(bus) {
    var icon = getIcon(bus);
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${icon})`;
    el.style.width = '33px';
    el.style.height = '36px';

    var marker = new mapboxgl.Marker(el)
        .setLngLat([bus.Lon, bus.Lat])
        .addTo(map);

    markers[bus.VehicleID] = marker;
}

function getIcon(bus) {
    // Select icon based on bus direction
    if (bus.DirectionNum === 0) {
        return '/images/red.png'; // Replace with your icon URL
    }
    return '/images/blue.png'; // Replace with your icon URL
}

function moveMarker(marker, bus) {
    // Change icon if bus has changed direction
    var icon = getIcon(bus);
    marker.getElement().style.backgroundImage = `url(${icon})`;

    // Move marker to new lat/lon
    marker.setLngLat([bus.Lon, bus.Lat]);
}

function getMarker(id) {
    return markers[id];
}

map.on('load', init(mapboxAccessToken));