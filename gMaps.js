var form = document.getElementById('srchParams');

form.addEventListener('submit', function(e) {
  var zip = e.target.elements.zipCode.value;
  console.log(zip);
  var tFrame = e.target.elements.timeFrame.value;
  console.log(tFrame);
  var mag = e.target.elements.magnitude.value;
  console.log(mag);

  if (tFrame === 'Past Hour') {
    tFrame = 'hour';
  } else if (tFrame === 'Past Day') {
    tFrame = 'day';
  } else if (tFrame === 'Past 7 Days') {
    tFrame = 'week';
  } else if (tFrame === 'Past 30 Days') {
    tFrame = 'month';
  }

  if (mag === 'Significant') {
    mag = 'significant_';
  } else if (mag === 'M4.5+') {
    mag = '4.5_';
  } else if (mag === 'M2.5+') {
    mag = '2.5_';
  } else if (mag === 'M1.0+') {
    mag = '1.0_';
  } else if (mag === 'All'){
    mag = 'all_';
  }

  console.log(tFrame);
  console.log(mag);

  e.preventDefault();

  getGeoCode(zip)
    .then(function(data) {
      var lat = data.results[0].geometry.location.lat;
      var lng = data.results[0].geometry.location.lng;
      console.log(lat);
      console.log(lng);

  quakeData(mag, tFrame)
    .then(function(data) {
      var results = data;

  initMap(lat, lng, data);

  initGraph(data);

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

function quakeData(mag, tFrame) {
  // console.log(mag);
  // console.log(tFrame);
  var endpoint = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/' + mag + tFrame + '.geojson';
  console.log(endpoint);
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

function initGraph(data) {
  var actTime = new Date(data.features[0].properties.time);
  console.log(actTime);

  for (var i = 0; i < data.features.length; i++) {
    var seisTime = new Date(data.features[i].properties.time);
  }
}
