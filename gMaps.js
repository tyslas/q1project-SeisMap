var form = document.getElementById('srchParams');

form.addEventListener('submit', function(e) {
  var zip = e.target.elements.zipCode.value;
  console.log(zip);
  // var radius = e.target.elements.radius.value;
  // console.log(radius);

  e.preventDefault();

  getGeoCode(zip)
    .then(function(data) {
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      console.log(lat);
      console.log(lng);

  quakeData()
    .then(function(data) {
      var results = data;

  initMap(lat, lng, data);

    });

    });
});

function getGeoCode(zip) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + zip + '/';
  // console.log(url);
  return fetch(url)
    .then(function(geocodeRes) {
      return geocodeRes.json();
    });
}

function initMap(lat, lng, data) {
  var origin = {lat: lat, lng: lng};
  console.log(data.features[0]);
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: origin,
    mapTypeId: 'terrain'
  });
  for (var i = 0; i < data.features.length; i++) {
    var coords = data.features[i].geometry.coordinates;
    var magnitude = data.features[i].properties.mag;
    var iStyle = getCircle(magnitude);
    var iName = data.features[i].properties.title;
    var latLng = new google.maps.LatLng(coords[1],coords[0]);
    var marker = new google.maps.Marker({
      position: latLng,
      title: iName,
      icon: iStyle,
      map: map

    });
  }
}

function quakeData() {
  var endpoint = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
  // console.log("quakes!!");
  return fetch(endpoint)
    .then(function(quakeData) {
      return quakeData.json();
    })
    .then(function(data) {
      return data;
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getCircle(magnitude) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: 'red',
    fillOpacity: 0.2,
    scale: Math.pow(2, magnitude) / 2,
    strokeColor: 'white',
    strokeWeight: 0.5
  };
}

// function eqfeed_callback(response) {
//   map.data.addGeoJson(response);
// }

// window.eqfeed_callback = function(results) {
//   console.log(results);
//   for (var i = 0; i < results.features.length; i++) {
//     var coords = results.features[i].geometry.coordinates;
//     var latLng = new google.maps.LatLng(coords[1],coords[0]);
//     var marker = new google.maps.Marker({
//       position: latLng,
//       map: map
//     });
//   }
// };

// function getMarkers(data) {
//   console.log(data.features);
//   for (var i = 0; i < data.features.length; i++) {
//     var coords = data.features[i].geometry.coordinates;
//     var latLng = new google.maps.LatLng(coords[1],coords[0]);
//     // console.log(coords);
//     var marker = new google.maps.Marker({
//       position: latLng,
//       map: map
//     });
//   }
// }

// map.data.setStyle(function(feature) {
//   var magnitude = feature.getProperty('mag');
//   return {
//     icon: getCircle(magnitude)
//   };
// });
