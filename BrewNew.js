var xhr = new XMLHttpRequest();

mapboxgl.accessToken = 'pk.eyJ1Ijoia3N1bW1lcmlsbCIsImEiOiJjajdreWRlNTgyaTl0MnFvMjRscnI1eDBvIn0.YzcP4_MZvzgm6HiMGcUsHQ';

// Initializes the map and grabs the style
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ksummerill/cjg5quod7335p2ro6mvwra9jf',
  center: [-96, 37.8],
  //center: [-121.3153, 44.0582],
  zoom: 4
});

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
});

// Hover over map and states become highlighted
var hoveredStateId =  null;

map.on('load', function () {
    map.addSource("states", {
        "type": "geojson",
        "data": "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson"
    });

    // The feature-state dependent fill-opacity expression will render the hover effect
    // when a feature's hover state is set to true.
    map.addLayer({
        "id": "state-fills",
        "type": "fill",
        "source": "states",
        "layout": {},
        "paint": {
          "fill-color": "#627BC1",
          "fill-opacity": ["case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0.5
            ]
          }
      });

    map.addLayer({
        "id": "state-borders",
        "type": "line",
        "source": "states",
        "layout": {},
        "paint": {
            "line-color": "#627BC1",
            "line-width": 2
        },
        "features": [
          {
              "type": "Feature",
              "properties": {},
              "geometry": {
                  "coordinates": [
                    -91.395263671875,
                    -0.9145729757782163
                  ]
              }
          }
        ]
    });

    // Add a symbol layer.
    map.addLayer({
      "id": "symbols",
      "type": "symbol",
      "source": {
          "type": "geojson",
          "data": {
              "type": "FeatureCollection",
              "features": [
                  {
                      "type": "Feature",
                      "properties": {},
                      "geometry": {
                          "type": "Point",
                          "coordinates": [
                              -98.0648,
                              41.7944

                            ]
                          }
                   },
                 ]
               }
             },
             "layout": {
                  "icon-image": "rocket-15"
             }
           });

    // When the user moves their mouse over the state-fill layer, update the
    // feature state for the feature under the mouse.
    map.on("mousemove", "state-fills", function(e) {
      if (e.features.length > 0) {
          if (hoveredStateId) {
              map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
          }
          hoveredStateId = e.features[0].id;
          map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: true});
          ///////////////map.setFeatureState({source: 'symbols', id: hoveredStateId}, { hover: false} )
          // console.log(hoveredStateId)


    // // EXPERIMENTING HERE // //
          // Upon clicking on Kansas, the symbol appears in the center of the state
          // map.on('click', 'symbols', function (h) {
          //   //if (e.features.length === '31')
          //   var nebraskaLongLat = e.features[0].id
          //   console.log(nebraskaLongLat);
          //
          // })


          // listen for hoveredStateId
          // and populate symbol at the centroid of the first and middle coordinates



          // Experiment (click is working in that it spits out number of arrays)
          map.on('click', 'state-fills', function (j) {
            clickedStateCoordinates = j.features[0].geometry.coordinates[0];
            map.flyTo(clickedStateCoordinates);
            console.log(clickedStateCoordinates);
          })


          // Center the map on the coordinates of the clicked symbol from the 'symbols' layer.
          map.on('click', 'symbols', function (e) {
            map.flyTo({center: e.features[0].geometry.coordinates});
            });

        }

    });


    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on("mouseleave", "state-fills", function() {
      if (hoveredStateId) {
          map.setFeatureState({source: 'states', id: hoveredStateId}, { hover: false});
      }
      hoveredStateId =  null;
    });


});




// Mapbox geocoder

  map.addControl(geocoder);

  map.on('load', function() {
      map.addSource('single-point', {
          "type": "geojson",
          "data": {
              "type": "FeatureCollection",
              "features": []
          }
      });

      map.addLayer({
          "id": "point",
          "source": "single-point",
          "type": "circle",
          "paint": {
              "circle-radius": 10,
              "circle-color": "#007cbf"
          }
      });


});

  // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
  // makes a selection and add a marker for the result.
  geocoder.on('result', function(ev) {
      map.getSource('single-point').setData(ev.result.geometry);

      //Give me JSON for geocoder response so I can know what to parse
      console.log(ev.result);
      console.log(ev.result.text);


      map.on('click', 'point', function (e) {
           var gimmeJson = e.features[0];
           var coordinates = e.features[0].geometry.coordinates.slice();
           var description = e.features[0].text;

           // Ensure that if the map is zoomed out such that multiple
           // copies of the feature are visible, the popup appears
           // over the copy being pointed to.
           while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
               coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
           }


           // create an element with the popup content
          var div = window.document.createElement('div');
          div.innerHTML = ev.result.text;
          //console.log(div.innerHTML);
           new mapboxgl.Popup()
           .setLngLat(coordinates)
           .setDOMContent(div)
           .addTo(map);


       });


   });
