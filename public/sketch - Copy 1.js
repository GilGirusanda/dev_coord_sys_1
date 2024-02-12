function setup() {
  let lat = gl_lat, lon = gl_lng;
  const button = document.getElementById('submit');
  button.addEventListener('click', async event => {
    const point_name = document.getElementById('point_name').value;
    const data = { lat, lon, point_name };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    const response = await fetch('/api', options);
    const json = await response.json();
    console.log(json);
  });

  if ('geolocation' in navigator) {
    console.log('geolocation available');

    console.log(lat, lon);
    document.getElementById('latitude').textContent = lat;
    document.getElementById('longitude').textContent = lon;
  } else {
    console.log('geolocation not available');
  }
}



  const map = L.map('map'); 
// Initializes map

map.setView([51.505, -0.09], 13); 
// Sets initial coordinates and zoom level

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map); 
// Sets map data source and associates with map

let marker, circle, zoomed;
var gl_lat, gl_lng;
const apiPointsLayer = L.geoJSON().addTo(map);

navigator.geolocation.watchPosition(success, error);

function success(pos) {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
    gl_lat = lat;
    gl_lng = lng;

    // if (marker) {
    //     map.removeLayer(marker);
    //     map.removeLayer(circle);
    // }
    // Removes any existing marker and circule (new ones about to be set)

    // Fetch points

    fetch('/api')
    .then(response => response.json())
    .then(data => {
        const geoJSONData = {
            type: "FeatureCollection",
            features: data.map(point => ({
                type: "Feature",
                properties: {
                    name: point.point_name,
                    timestamp: point.timestamp,
                    id: point._id
                },
                geometry: {
                    type: "Point",
                    coordinates: [point.lon, point.lat]
                }
            }))
        };
        L.geoJSON(geoJSONData).addTo(apiPointsLayer);
        //L.geoJSON(data.features).addTo(apiPointsLayer);
    })
    .catch(error => {
        console.error('Error fetching API points:', error);
    });

    //marker = L.marker([lat, lng]).addTo(map);
    //circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
    marker = L.marker([lat, lng], { icon: L.divIcon({ className: 'current-location-marker' }) }).addTo(map);
    circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
    // Adds marker to the map and a circle for accuracy

    if (!zoomed) {
        zoomed = map.fitBounds(circle.getBounds()); 
    }
    // Set zoom to boundaries of accuracy circle

    map.setView([lat, lng]);
    // Set map focus to current user position

    // Add the current location marker to the GeoJSON layer
    //apiPointsLayer.clearLayers();
    //apiPointsLayer.addLayer(marker);
}

function error(err) {

    if (err.code === 1) {
        alert("Please allow geolocation access");
    } else {
        alert("Cannot get current location");
    }

}
