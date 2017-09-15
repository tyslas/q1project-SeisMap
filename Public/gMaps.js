google.charts.load('current', {'packages':['bar']});
google.charts.setOnLoadCallback(drawBasic);
var magArr = [];
var timeArr = [];
var datesArr = [];

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

      var featArr = Array.from(data.features);
      var featArrLen = featArr.length;

      for (var i = 0; i < featArrLen; i++) {
        datesArr.push(data.features[i].properties.time);
      }
      console.log('datesArr: ', datesArr);

      for (var i = 0; i < featArrLen; i++) {
        timeArr.push(new Date(data.features[i].properties.time));
      }
      console.log('timeArr: ', timeArr);


      for (var j = 0; j < featArrLen; j++) {
        magArr.push(data.features[j].properties.mag);
      }
      console.log('magArr: ', magArr);

  initMap(lat, lng, data);

  drawBasic();

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
  var endpoint = 'https://galvanize-cors-proxy.herokuapp.com/http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/' + mag + tFrame + '.geojson';
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

// function initGraph(data) {
//   var w = 600;
//   var h = 300;
//   console.log(data);
//   d3.select('#timeline')
//       .append('svg')
//       .attr('width', w)
//       .attr('height', h)
//       // .attr('background-color', 'grey');
//
//       .selectAll('rect.bar')
//       .data(data)
//       .enter()
//       .append('rect')
//       .attr('width', 20)
//       .attr('height', 100)
//       .attr('x', 10)
//       .attr('y', 20)
//       .attr('fill', 'black');
//
//   var actTime = new Date(data.features[0].properties.time);
//   console.log(actTime);
//
//   // for (var i = 0; i < data.features.length; i++) {
//   //   var seisTime = new Date(data.features[i].properties.time);
//   // }
// }

function drawBasic() {
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Time of Event');
  data.addColumn('number', 'Magnitude of Event');

  console.log(timeArr[0]);


  // write a for loop that loops through your array
  // and data.addRows(for that data)
  // then fix min/max range
  for (var i = 0; i < magArr.length; i++) {
    // console.log(magArr[i]);
    // console.log(timeArr[i]);
    var currDate = new Date(timeArr[i]);
    data.addRows([
            [new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()), magArr[i]],
    ])
  }
  console.log(data.toJSON());

  var options = {
    chart: {
      title: 'Seismic Events'
    },
    hAxis: {
      title: 'Time of Event',
      days: {format: ['MMM dd']},
      viewWindow: {
        min: new Date(2017, 08, 14, 0),
        max: new Date(2017, 09, 16, 0)
      }
    },
    vAxis: {
      title: 'Magnitude'
    }
  };

  var chart = new google.charts.Bar(
    document.getElementById('chart_div'));

  chart.draw(data, google.charts.Bar.convertOptions(options));
}
