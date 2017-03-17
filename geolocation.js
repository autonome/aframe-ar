/*

Themes
* AR on the web
* Geofenced web content (limit to within specified bounds)
* Digital signage
* Centralized AR - can see stuff positioned relative to a fixed point

Notes to process:
* layers served from URLs
* AFrame camera position update relative to geolocation change (to make objects grow bigger as you get closer, etc)
* self-relative objects (eg, surrounded by a swarm of fish)
* relative positioning of objects based on user position (aframe camera angle?)

TODO:
* Find current position
  * Check accuracy of current position
  * Test polling getCurrentPosition vs watch()
* Set bounding area
* Determine if a position is within the bounding area
* Render object if within the bounding area
* Determine direction from device and set object position accordingly
* Determine height from the gorund and set object position accordingly
  * Test height accuracy
* Testing using orientation api
* Testing using devicemotion api

Resources
* good reading: http://www.movable-type.co.uk/scripts/latlong.html
* https://www.npmjs.com/package/node-open-geocoder
* https://www.npmjs.com/package/location-math (missing source in github)
* bounding example https://gist.github.com/ederoyd46/2605218
* gmaps api docs: https://developers.google.com/maps/documentation/javascript/
* trip meter example: http://www.html5rocks.com/en/tutorials/geolocation/trip_meter/
* orientation api: http://www.html5rocks.com/en/tutorials/device/orientation/
* nice js lib, no bounding features tho: https://github.com/onury/geolocator

Compass heading
* https://github.com/ai/compass.js
* https://mobiforge.com/design-development/sense-and-sensor-bility-access-mobile-device-sensors-with-javascript
* http://www.smartjava.org/content/html5-geolocation-api-measure-speed-and-heading-your-car


*/

(function(window) {
  var geoUpdates = [];

  function onPosition(position) {

    // Timestamp is incorrectly microseconds in Firefox on Mac
    // (and possibly elsewhere).
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1296125
    var ts = position.timestamp.toString().length > 13 ?
      position.timestamp / 1000 : position.timestamp;

    var thisPosition = {
      obj: position.coords,
      time: ts,
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      acc: position.coords.accuracy,
      alt: position.coords.altitude,
      altacc: position.coords.altitudeAccuracy,
      hd: position.coords.heading,
      sp: position.coords.speed
    };

    var lastPosition = geoUpdates.length ?
      geoUpdates[ geoUpdates.length - 1 ] : thisPosition;

    var lat1 = thisPosition.lat,
        lon1 = thisPosition.lon,
        lat2 = lastPosition.lat,
        lon2 = lastPosition.lon;

    //var distance = Haversine(lat1, lon1, lat2, lon2);
    var distance = geolib.distance(thisPosition.obj, lastPosition.obj);

    thisPosition.metersFromLastPosition = distance;

    geoUpdates.push(thisPosition)

    // Update the geo feedback panel.
    var positionDate = new Date(thisPosition.time),
        lastPositionDate = new Date(lastPosition.time),
        minsSinceLastUpdate = ((thisPosition.time - lastPosition.time) / 1000 / 60).toFixed(0);

    var coords = document.querySelector('.coords');
    var msg = positionDate
      + ' (' + minsSinceLastUpdate + ' secs)'
      + '<br>'
      + thisPosition.lat + ':' + thisPosition.lon
      + '<br>'
      + 'updates:' + geoUpdates.length
      + ', heading:' + thisPosition.hd
      + ', speed:' + thisPosition.sp
      + ', distance:' + distance;
    coords.innerHTML = msg;

    if (position.coords.latitude != lastPosition.latitude ||
        position.coords.longitude != lastPosition.longitude) {
      coords.style.backgroundColor = coords.style.backgroundColor == 'black' ? 'silver' : 'black';
    }
  }

  function onGeoError(ex) {
    console.log(ex);
  }

  var geoOptions = {
    enableHighAccuracy: true
    /*
    , maximumAge        : 5000
    */
  };

  function deg2rad(degrees){
    var radians = degrees * (Math.PI/180);
    return radians;
  }

  function Haversine(lat1, lon1, lat2, lon2) {
    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;
    var earthRadius =  6369087 ; // in meters. 3959 in miles.
    var alpha    = deltaLat/2;
    var beta     = deltaLon/2;
    var a        = Math.sin(deg2rad(alpha)) * Math.sin(deg2rad(alpha)) +
                   Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                   Math.sin(deg2rad(beta)) * Math.sin(deg2rad(beta));
    var c        = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distance =  earthRadius * c;
    return distance.toFixed(2);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onPosition, onGeoError, geoOptions);
    navigator.geolocation.watchPosition(onPosition, onGeoError, geoOptions);
  }
})(window);

/*

Javascript for finding latitude and longitude range boundaries.

Based on the excellent Java example by http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates

Lives at https://gist.github.com/ederoyd46/2605218

*/
var GeoLocation = GeoLocation ? GeoLocation : {
  TO_RADIAN: 0.0174532925,
  TO_DEGREE: 57.2957795,
  EARTH_RADIUS: 6371.01,
  TO_MILE: 0.621371192,
  TO_KM: 1.609344,
  MIN_LAT: function() { return GeoLocation.degreeToRadian(-90) },
  MAX_LAT: function() { return GeoLocation.degreeToRadian(90) },  
  MIN_LON: function() { return GeoLocation.degreeToRadian(-180) },  
  MAX_LON: function() { return GeoLocation.degreeToRadian(180) },  
  
  degreeToRadian: function (degree) { return degree * GeoLocation.TO_RADIAN },
  radianToDegree: function (radian) { return radian * GeoLocation.TO_DEGREE },
  kmToMile: function (km) {return km * GeoLocation.TO_MILE },
  mileToKm: function (mile) {return mile * GeoLocation.TO_KM },

  buildLocationRange: function(latitude, longitude, boundaryInMiles) {
    var degLat = latitude;
    var degLon = longitude;
    var radLat = GeoLocation.degreeToRadian(degLat);
    var radLon = GeoLocation.degreeToRadian(degLon);
    
    var location = {  degLat: degLat
                    , degLon: degLon
                    , radLat: radLat
                    , radLon: radLon
                   };

    GeoLocation.checkBounds(location);
    var locationRange = GeoLocation.boundingCoordinates(location, GeoLocation.mileToKm(boundaryInMiles));
    
    return locationRange;
  },
  
  checkBounds: function(location) {
    if (location.radLat < GeoLocation.MIN_LAT || location.radLat > GeoLocation.MAX_LAT ||
        location.radLon < GeoLocation.MIN_LON || location.radLon > GeoLocation.MAX_LON) {
          console.log("radLat or radLon is out of bounds");
    }  
  },
  
  distance: function(location1, location2) {
    return Math.acos(Math.sin(location1.radLat) * Math.sin(location2.radLat) +
        Math.cos(location1.radLat) * Math.cos(location2.radLat) *
        Math.cos(location1.radLon - location2.radLon)) * GeoLocation.EARTH_RADIUS;
  },
  
  boundingCoordinates: function(location, distance) {
    if (!location || distance < 0) {
      console.log("no location or distance");
      return;
    }
    
    var radius = GeoLocation.EARTH_RADIUS;
    var radDist = distance / radius;
    var minLat = location.radLat - radDist;
    var maxLat = location.radLat + radDist;

    var minLon, maxLon;
    
    if (minLat > GeoLocation.MIN_LAT() && maxLat < GeoLocation.MAX_LAT()) {
      var deltaLon = Math.asin(Math.sin(radDist) / Math.cos(location.radLat));
      minLon = location.radLon - deltaLon;
      if (minLon < GeoLocation.MIN_LON()) minLon += 2 * Math.PI;
      maxLon = location.radLon + deltaLon;
      if (maxLon > GeoLocation.MAX_LON()) maxLon -= 2 * Math.PI;
    } else {
      // a pole is within the distance
      minLat = Math.max(minLat, GeoLocation.MIN_LAT());
      maxLat = Math.min(maxLat, GeoLocation.MAX_LAT());
      minLon = GeoLocation.MIN_LON();
      maxLon = GeoLocation.MAX_LON();
    }
    
    var locationRange = {
      lat: location.degLat
      , lon: location.degLon
      , minLat: GeoLocation.radianToDegree(minLat)
      , maxLat: GeoLocation.radianToDegree(maxLat)
      , minLon: GeoLocation.radianToDegree(minLon)
      , maxLon: GeoLocation.radianToDegree(maxLon)
    };
    return locationRange;
  }  
}
