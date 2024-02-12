function setup() {
  // let lat = gl_lat, lon = gl_lng;
  // const button = document.getElementById('submit');
  // button.addEventListener('click', async event => {
  //   const point_name = document.getElementById('point_name').value;
  //   const data = { gl_lat, gl_lng, point_name };
  //   const options = {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(data)
  //   };
  //   const response = await fetch('/api', options);
  //   const json = await response.json();
  //   console.log(json);
  // });

  if ('geolocation' in navigator) {
    console.log('geolocation available');

    // console.log(gl_lat, gl_lng);
    // document.getElementById('latitude').textContent = gl_lat;
    // document.getElementById('longitude').textContent = gl_lng;
  } else {
    console.log('geolocation not available');
  }
}


const button = document.getElementById('submit');
  button.addEventListener('click', async event => {
    const point_name = document.getElementById('point_name').value;
    let lat = gl_lat, lon = gl_lng;
    console.log('LOG', lat + ' ' + lon)
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



// Initializes map
const map = L.map('map'); 

// Sets initial coordinates and zoom level
map.setView([51.505, -0.09], 13); 

// Sets map data source and associates with map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let marker, circle, zoomed, polyline;
var gl_lat, gl_lng;
const apiPointsLayer = L.geoJSON().addTo(map);

navigator.geolocation.watchPosition(success, error);

function success(pos) {
    console.log('Geolocation updated:', pos.coords.latitude + ' ' + pos.coords.longitude);

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
    document.getElementById('latitude').textContent = lat;
    document.getElementById('longitude').textContent = lng;
    gl_lat = lat;
    gl_lng = lng;

    // Clear old `current position`
    if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
    }

    // Adds marker to the map and a circle for accuracy
    marker = L.marker([lat, lng], { icon: L.divIcon({ className: 'current-location-marker' }) }).addTo(map);
    circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
    
    // Set zoom to boundaries of accuracy circle
    if (!zoomed) {
        zoomed = map.fitBounds(circle.getBounds()); 
    }

    // Set map focus to current user position
    map.setView([lat, lng]);

    // Add the current location marker to the GeoJSON layer
    //apiPointsLayer.clearLayers();
    //apiPointsLayer.addLayer(marker);

    // Fetch points from API
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
            console.log(geoJSONData)
            apiPointsLayer.clearLayers();
            apiPointsLayer.addData(geoJSONData);
        //      // Check if the features have valid coordinates before adding them
        // geoJSONData.features.forEach(feature => {
        //     const coordinates = feature.geometry.coordinates;
        //     if (coordinates && coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
        //         apiPointsLayer.addData(feature);
        //     } else {
        //         console.warn('Invalid coordinates found:', feature);
        //     }
        // });

            // Add popups to markers in the GeoJSON layer
            apiPointsLayer.eachLayer(layer => {
                // const { name, timestamp, id } = layer.feature.properties;
                // layer.bindPopup(`<b>${name}</b><br>Timestamp: ${timestamp}<br>ID: ${id}`);
              const { name, timestamp } = layer.feature.properties;
                layer.bindPopup(`<b>${name}</b><br>Timestamp: ${timestamp}`);
            });
        })
        .catch(error => {
            console.error('Error fetching API points:', error, lat + ' ' + lng);
        });
}

function error(err) {

    if (err.code === 1) {
        alert("Please allow geolocation access");
    } else {
        alert("Cannot get current location");
    }

}
