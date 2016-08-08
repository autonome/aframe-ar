# A-Frame AR

Experimenting with AR on the mobile Web using [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
and [A-Frame](https://aframe.io/), the declarative VR library from Mozilla.

## Usage

As a user:

* Install Firefox on Android from the Play Store
* Open http://autonome.github.io/aframe-ar in Firefox

As a developer:

* Fork the repo
* Publish your copy on Github pages or wherever you want


NOTE to iPhone/iPad users:

Apple chose to not implement the getUserMedia API, so this will not work on iOS or Safari.
Let Apple know that you want a better mobile web on iOS devices by [filing a request with Apple](https://bugreport.apple.com).


## Use-Cases

* Create your own geolocated AR game in the style of Pokémon GO
* World-scale digital graffiti
* Create massive flying mythical creatures to guard your city
* Political signage megabattle with your neighbor
* Add digital signage to your business via Bluetooth beacon or QR code pointing to your AR web page
* Leave reviews of art, architecture, businesses, somebody's car, intersections, fence posts, empty lots, garbage cans

## TODO

* Add Chrome/Android browser support
* Build as an A-Frame plug-in

Geolocation
* Add coarse-grained geolocation support via geolocation web API
* Explore pluggable integration of Google maps API and others

Fun additions
* Use time of day and sunrise/set info to change light source angle and brightness
* Use coarse compass data via orientation API and change light-source in A-Frame scene to match
* Use Forecast.io or other weather API to set light source brightness or even to obscure objects in scene


## Contributing

This is a technology demo. Feel free to fork and improve or use however you like.

I wrote this as an example of what is possible.
I might take pull-requests or augment the code based on pull-requests,
but currently have no plans to turn this into a full-featured AR web solution at this time.


## Other Things

* [JS ARToolkit](https://github.com/artoolkit/jsartoolkit5)
* [Awe.js](https://github.com/buildar/awe.js)(abandoned)

